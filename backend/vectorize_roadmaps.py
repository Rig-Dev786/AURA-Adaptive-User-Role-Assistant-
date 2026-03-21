import os
import json
import numpy as np
from sentence_transformers import SentenceTransformer

def vectorize():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    kb_file = os.path.join(current_dir, "..", "data", "knowledge_base.json")
    out_embeddings = os.path.join(current_dir, "..", "data", "embeddings.npy")
    out_index = os.path.join(current_dir, "..", "data", "skill_index.json")
    
    with open(kb_file, "r", encoding="utf-8") as f:
        kb = json.load(f)
        
    print("Loading model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    texts = []
    skill_keys = list(kb.keys())
    
    for skill in skill_keys:
        data = kb[skill]
        desc = data.get("description", "")
        
        # Collect top resources
        resource_titles = []
        for cat in ["official_docs", "courses", "videos", "articles"]:
            if cat in data["resources"]:
                for r in data["resources"][cat][:2]:
                    resource_titles.append(r["title"])
                    
        text = f"{skill}. {desc} {' '.join(resource_titles)}"
        texts.append(text)
        
    print(f"Encoding {len(texts)} skills...")
    embeddings = model.encode(texts, show_progress_bar=True)
    
    np.save(out_embeddings, embeddings)
    with open(out_index, "w", encoding="utf-8") as f:
        json.dump(skill_keys, f, indent=2)
        
    print(f"Saved embeddings to {out_embeddings}")

if __name__ == "__main__":
    vectorize()
