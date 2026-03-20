# AURA — Firestore Client
# Owner: Member B

from firebase_admin import firestore
from datetime import datetime

db = firestore.client()

def save_analysis(uid: str, analysis_id: str, data: dict):
    doc_id = f"{uid}_{analysis_id}"
    db.collection("analyses").document(doc_id).set({
        "uid":         uid,
        "analysis_id": analysis_id,
        "created_at":  datetime.utcnow().isoformat(),
        "match_score": data.get("match_score", 0),
        "gap_count":   len(data.get("gaps", [])),
        "full_result": data,
    })

def get_history(uid: str) -> list:
    docs = db.collection("analyses").where("uid", "==", uid).stream()
    return [
        {
            "analysis_id":    d.get("analysis_id"),
            "created_at":     d.get("created_at"),
            "match_score":    d.get("match_score"),
            "gap_count":      d.get("gap_count"),
        }
        for doc in docs
        for d in [doc.to_dict()]
    ]

def get_analysis(uid: str, analysis_id: str) -> dict:
    doc_id = f"{uid}_{analysis_id}"
    doc = db.collection("analyses").document(doc_id).get()
    if not doc.exists:
        return {}
    return doc.to_dict().get("full_result", {})
