# AURA — Flask Backend
# Owner: Member B

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth as fb_auth
import json, os
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

# Load course catalog once at startup
with open("catalog.json") as f:
    CATALOG = json.load(f)

def get_uid(req):
    token = req.headers.get("Authorization", "").replace("Bearer ", "")
    decoded = fb_auth.verify_id_token(token)
    return decoded["uid"]


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze():
    uid = get_uid(request)
    resume_file = request.files.get("resume_file")
    jd_text = request.form.get("jd_text", "")

    resume_text = extract_text(resume_file)
    user_skills = extract_skills(resume_text)
    jd_skills   = extract_skills(jd_text)

    gaps, match_score = score_gaps(user_skills, jd_skills, CATALOG)
    result = generate_pathway(gaps, CATALOG)

    analysis_id = f"{uid}_{int(__import__('time').time())}"
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
    save_analysis(uid, analysis_id, response)
    return jsonify(response)


@app.route("/save", methods=["POST"])
def save():
    uid = get_uid(request)
    data = request.get_json()
    save_analysis(uid, data["analysis_id"], data)
    return jsonify({"saved": True})


@app.route("/history", methods=["GET"])
def history():
    uid = get_uid(request)
    return jsonify({"analyses": get_history(uid)})


@app.route("/history/<analysis_id>", methods=["GET"])
def history_detail(analysis_id):
    uid = get_uid(request)
    return jsonify(get_analysis(uid, analysis_id))


@app.route("/report/<analysis_id>", methods=["GET"])
def report(analysis_id):
    uid = get_uid(request)
    data = get_analysis(uid, analysis_id)
    # TODO: Member B — generate PDF with reportlab and return send_file(...)
    return jsonify({"message": "PDF generation coming soon"})


if __name__ == "__main__":
    app.run(debug=True, port=int(os.getenv("PORT", 5000)))
