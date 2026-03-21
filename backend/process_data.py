import os
import json
import re

def process_roadmaps(data_dir):
    knowledge_base = {}

    for root, dirs, files in os.walk(data_dir):
        if os.path.basename(root) != "content":
            continue

        roadmap_name = os.path.basename(os.path.dirname(root))

        for file in files:
            if not file.endswith(".md"):
                continue

            skill_name = file.split("@")[0].lower()
            if skill_name.endswith(".md"):
                skill_name = skill_name[:-3]

            file_path = os.path.join(root, file)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            lines = content.split('\n')
            description = ""
            for i, line in enumerate(lines):
                if line.startswith("# "):
                    for j in range(i+1, len(lines)):
                        p = lines[j].strip()
                        if p and not p.startswith('-') and not p.startswith('#'):
                            description = p
                            break
                    break

            links = re.findall(r"\[([^\]]+)\]\((https?://[^\)]+)\)", content)

            resources = {
                "official_docs": [],
                "articles":      [],
                "videos":        [],
                "courses":       []
            }

            for raw_title, url in links:
                title = re.sub(r"^\[@[^@]+@\]", "", raw_title).strip()
                title = re.sub(r"^@[^@]+@\s*", "", title).strip()

                domain = url.split("://")[-1].split("/")[0].lower()

                is_official = False
                is_course = False
                is_video = False

                if "official" in raw_title.lower() or skill_name.replace("-", "") in domain.replace(".", ""):
                    is_official = True

                if "youtube.com" in domain or "youtu.be" in domain or "video" in raw_title.lower():
                    is_video = True

                if "developer.mozilla.org" in url.lower() or "w3schools" in domain or "freecodecamp" in domain or "course" in raw_title.lower():
                    is_course = True

                if is_official:
                    cat = "official_docs"
                elif is_video:
                    cat = "videos"
                elif is_course:
                    cat = "courses"
                else:
                    cat = "articles"

                resources[cat].append({
                    "title": title,
                    "url": url
                })

            if skill_name not in knowledge_base:
                knowledge_base[skill_name] = {
                    "description": description,
                    "roadmaps": [roadmap_name],
                    "resources": {
                        "official_docs": [],
                        "articles":      [],
                        "videos":        [],
                        "courses":       []
                    }
                }
            elif roadmap_name not in knowledge_base[skill_name]["roadmaps"]:
                knowledge_base[skill_name]["roadmaps"].append(roadmap_name)
                if len(description) > len(knowledge_base[skill_name]["description"]):
                    knowledge_base[skill_name]["description"] = description

            existing_urls = set()
            for cat in ["official_docs", "articles", "videos", "courses"]:
                for r in knowledge_base[skill_name]["resources"][cat]:
                    existing_urls.add(r["url"])

            for cat, r_list in resources.items():
                for r in r_list:
                    if r["url"] not in existing_urls:
                        knowledge_base[skill_name]["resources"][cat].append(r)
                        existing_urls.add(r["url"])

    return knowledge_base

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(current_dir, "..", "data", "roadmaps")
    out_file = os.path.join(current_dir, "..", "data", "knowledge_base.json")

    print(f"Scanning {data_dir}...")
    kb = process_roadmaps(data_dir)

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(kb, f, indent=2)

    total_skills = len(kb)
    total_resources = sum(
        len(r)
        for s in kb.values()
        for r_list in s["resources"].values()
        for r in r_list
    )

    breakdown = {}
    for s in kb.values():
        for r in s["roadmaps"]:
            breakdown[r] = breakdown.get(r, 0) + 1

    print(f"Processed {total_skills} unique skills.")
    print(f"Collected {total_resources} unique resources.")
    print("Breakdown per roadmap:")
    for r, c in sorted(breakdown.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {r}: {c} skills")
