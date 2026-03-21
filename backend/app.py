from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth as fb_auth
import json, os, time
from dotenv import load_dotenv

from parser import extract_text
from firestore_client import save_analysis, get_history, get_analysis
from ml.extractor import extract_skills
from ml.gap_scorer import score_gaps
from ml.pathway import generate_pathway

load_dotenv()

app = Flask(__name__)
CORS(app)

# Firebase init
cred = credentials.Certificate(os.getenv("FIREBASE_SERVICE_ACCOUNT"))
firebase_admin.initialize_app(cred)

# Load catalog once at startup
with open("catalog.json") as f:
    CATALOG = json.load(f)

def get_uid(req):
    token = req.headers.get("Authorization", "").replace("Bearer ", "").strip()
    if not token:
        return None
    try:
        decoded = fb_auth.verify_id_token(token)
        return decoded["uid"]
    except Exception:
        return None


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze():
    resume_file = request.files.get("resume_file")
    jd_text     = request.form.get("jd_text", "").strip()

    if not resume_file:
        return jsonify({"error": "No resume file uploaded"}), 400
    if not jd_text:
        return jsonify({"error": "No job description provided"}), 400

    # Debug log
    print(f"[analyze] JD text length: {len(jd_text)}")
    print(f"[analyze] JD preview: {jd_text[:200]}")

    resume_text = extract_text(resume_file)
    print(f"[analyze] Resume text length: {len(resume_text)}")

    user_skills = extract_skills(resume_text)
    jd_skills   = extract_skills(jd_text)

    print(f"[analyze] User skills ({len(user_skills)}): {user_skills}")
    print(f"[analyze] JD skills ({len(jd_skills)}): {jd_skills}")

    # If JD extraction returns 0 skills, try broader extraction
    if len(jd_skills) == 0:
        print("[analyze] WARNING: 0 JD skills extracted — check JD text format")
        return jsonify({
            "error": f"Could not extract any skills from the job description. Make sure it contains specific skill names like 'Python', 'Docker', 'SQL' etc. JD received: {jd_text[:300]}"
        }), 400

    gaps, match_score = score_gaps(user_skills, jd_skills, CATALOG)
    result = generate_pathway(gaps, CATALOG)

    analysis_id = f"analysis_{int(time.time())}"
    uid = get_uid(request)
    if uid:
        analysis_id = f"{uid}_{int(time.time())}"

    response = {
        "analysis_id":  analysis_id,
        "user_skills":  user_skills,
        "jd_skills":    jd_skills,
        "gaps":         gaps,
        "pathway":      result["pathway"],
        "reasoning":    result["reasoning"],
        "match_score":  match_score,
        "total_hours":  result["total_hours"],
    }

    if uid:
        try:
            save_analysis(uid, analysis_id, response)
        except Exception as e:
            print(f"[analyze] Firestore save failed: {e}")

    return jsonify(response)


@app.route("/save", methods=["POST"])
def save():
    uid = get_uid(request)
    if not uid:
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json()
    save_analysis(uid, data["analysis_id"], data)
    return jsonify({"saved": True})


@app.route("/history", methods=["GET"])
def history():
    uid = get_uid(request)
    if not uid:
        return jsonify({"analyses": []})
    return jsonify({"analyses": get_history(uid)})


@app.route("/history/<analysis_id>", methods=["GET"])
def history_detail(analysis_id):
    uid = get_uid(request)
    if not uid:
        return jsonify({}), 401
    return jsonify(get_analysis(uid, analysis_id))


if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
