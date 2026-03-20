# AURA — Pathway Generator
# Owner: Member C

def generate_pathway(gaps: list, catalog: list) -> dict:
    """
    Build ordered learning pathway from sorted gaps.
    No LLM — pure template-based generation.
    Deterministic, reproducible, zero hallucination.
    """
    pathway     = []
    total_hours = 0

    for i, gap in enumerate(gaps):
        course       = gap["recommended_course"]
        hours        = course.get("duration_hours", 0)
        total_hours += hours

        pathway.append({
            "order":        i + 1,
            "course_id":    course["id"],
            "title":        course["title"],
            "duration_hours": hours,
            "url":          course.get("url", ""),
            "why":          _generate_why(gap, i),
        })

    reasoning = _generate_reasoning(gaps)

    return {
        "pathway":     pathway,
        "reasoning":   reasoning,
        "total_hours": total_hours,
    }


def _generate_why(gap: dict, index: int) -> str:
    severity = gap["gap_severity"]
    skill    = gap["skill"]

    if severity > 0.8:
        return (
            f"{skill} is a critical gap for this role and not found in your resume. "
            f"Start here first."
        )
    elif severity > 0.5:
        return (
            f"You have partial exposure to {skill}. "
            f"This course will solidify your understanding."
        )
    else:
        return (
            f"You have some familiarity with {skill}. "
            f"This course will close the remaining gap."
        )


def _generate_reasoning(gaps: list) -> str:
    if not gaps:
        return "Great news — your resume closely matches the job requirements. No major gaps found."

    top3        = [g["skill"] for g in gaps[:3]]
    total_hours = sum(g["recommended_course"].get("duration_hours", 0) for g in gaps)

    return (
        f"Your resume shows strong alignment in some areas, but the role "
        f"requires expertise in {', '.join(top3)}. "
        f"The pathway below addresses your {len(gaps)} skill gap(s) "
        f"in order of importance. "
        f"Estimated total learning time: {total_hours} hours."
    )
