# AURA — Gap Scorer
# Owner: Member C

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from rapidfuzz import fuzz
import numpy as np

# Load once at module level — expensive operation
model = SentenceTransformer("all-MiniLM-L6-v2")

def score_gaps(resume_skills: list, jd_skills: list, catalog: list) -> tuple:
    """
    Core gap scoring algorithm — no LLM, pure ML math.

    Steps:
      1. Fuzzy match each JD skill against all resume skills
      2. If best match < 75, classify as a gap
      3. Find best course via sentence-transformer cosine similarity
      4. Sort gaps by severity (descending) — this IS the adaptive ordering
      5. Compute overall match_score

    Returns: (gaps list, match_score int)
    """

    # Pre-encode all catalog entries once
    catalog_texts    = [c["skills_covered"] for c in catalog]
    catalog_encodings = model.encode(catalog_texts)

    gaps    = []
    matched = 0

    for jd_skill in jd_skills:
        # Step 1 — fuzzy match against every resume skill
        best_score = 0
        if resume_skills:
            best_score = max(
                fuzz.token_sort_ratio(jd_skill, r_skill)
                for r_skill in resume_skills
            )

        # Step 2 — threshold check
        if best_score >= 75:
            matched += 1
            continue

        gap_severity = round(1 - best_score / 100, 2)

        # Step 3 — find best course via semantic similarity
        gap_encoding     = model.encode([jd_skill])
        similarity_scores = cosine_similarity(gap_encoding, catalog_encodings)[0]
        best_idx         = int(np.argmax(similarity_scores))
        best_course      = catalog[best_idx]

        gaps.append({
            "skill":              jd_skill,
            "gap_severity":       gap_severity,
            "recommended_course": best_course,
            "reason":             "Not found in resume" if best_score == 0
                                  else f"Partial match ({best_score}%)",
        })

    # Step 4 — sort by severity descending (adaptive ordering)
    gaps.sort(key=lambda g: g["gap_severity"], reverse=True)

    # Step 5 — match score
    total       = len(jd_skills)
    match_score = round(matched / total * 100) if total > 0 else 0

    return gaps, match_score
