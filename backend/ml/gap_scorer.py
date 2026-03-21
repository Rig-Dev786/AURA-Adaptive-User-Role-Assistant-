# AURA — Gap Scorer
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")
_catalog_cache = {}

def _get_catalog_encodings(catalog: list):
    key = id(catalog[0]) if catalog else 0
    if key not in _catalog_cache:
        texts = [f"{c['title']} {c['skills_covered']}" for c in catalog]
        _catalog_cache[key] = model.encode(texts, show_progress_bar=False)
    return _catalog_cache[key]


def _skills_match(jd_skill: str, resume_skills: list) -> tuple:
    """
    Returns (is_match: bool, best_score: int)
    Multi-strategy matching:
    1. Exact match (case-insensitive)
    2. Substring in either direction  
    3. Fuzzy token sort ratio
    """
    jd_lower = jd_skill.lower().strip()
    resume_lower = [s.lower().strip() for s in resume_skills]

    # Strategy 1: exact
    if jd_lower in resume_lower:
        return True, 100

    # Strategy 2: substring both directions (handles "Apache Spark" ↔ "Spark")
    for r in resume_lower:
        if len(r) > 2 and len(jd_lower) > 2:
            if jd_lower in r or r in jd_lower:
                return True, 90

    # Strategy 3: fuzzy
    if resume_skills:
        best = max(fuzz.token_sort_ratio(jd_skill, r) for r in resume_skills)
        if best >= 68:
            return True, best
        return False, best

    return False, 0


def score_gaps(resume_skills: list, jd_skills: list, catalog: list) -> tuple:
    """
    Score skill gaps between resume and JD.
    Returns (gaps list, match_score int 0-100)
    """
    if not jd_skills:
        print("[gap_scorer] WARNING: jd_skills is empty — cannot score gaps")
        return [], 0

    catalog_encodings = _get_catalog_encodings(catalog)
    gaps    = []
    matched = 0

    for jd_skill in jd_skills:
        is_match, best_score = _skills_match(jd_skill, resume_skills)

        if is_match:
            matched += 1
            print(f"[gap_scorer] MATCH: {jd_skill} (score={best_score})")
            continue

        gap_severity = round(max(0.1, 1 - best_score / 100), 2)
        print(f"[gap_scorer] GAP: {jd_skill} (severity={gap_severity})")

        # Find best course
        gap_enc    = model.encode([jd_skill], show_progress_bar=False)
        sims       = cosine_similarity(gap_enc, catalog_encodings)[0]
        best_idx   = int(np.argmax(sims))
        best_course = catalog[best_idx]

        gaps.append({
            "skill":        jd_skill,
            "gap_severity": gap_severity,
            "recommended_course": {
                "id":             best_course["id"],
                "title":          best_course["title"],
                "duration_hours": best_course.get("duration_hours", 0),
                "url":            best_course.get("url", ""),
                "provider":       best_course.get("provider", ""),
                "skills_covered": best_course.get("skills_covered", ""),
            },
            "reason": "Not found in resume" if best_score == 0
                      else f"Partial match ({best_score}%)",
        })

    gaps.sort(key=lambda g: g["gap_severity"], reverse=True)

    total       = len(jd_skills)
    match_score = round(matched / total * 100) if total > 0 else 0

    print(f"[gap_scorer] Final: {matched}/{total} matched → {match_score}%")
    return gaps, match_score
