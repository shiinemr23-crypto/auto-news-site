"""One-time cleanup for legacy featured articles with inline attributions.

Run a preview first:
    python clean_featured_bodies.py

Apply the rewrites after reviewing the preview:
    python clean_featured_bodies.py --apply
"""

import argparse
import os
import time

import google.generativeai as genai
from dotenv import load_dotenv

from store import db

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3.1-flash-lite")

EDITOR_PROMPT = """Edit this existing news feature into clean, neutral magazine prose.

Rules:
- Preserve every factual claim, number, date, person, place, quote, and uncertainty already present.
- Remove all mentions of publishers and all attribution phrasing, including "according to", "reports", "reported by", "as noted by", "per reporting", and similar language.
- Do not add facts, remove substantive facts, infer motives, or change the article's meaning.
- Keep the existing paragraph breaks and return only the article body.
- Do not add a headline, citations, footnotes, a source list, or commentary. The frontend already lists verified sources at the end.

Article body:
{body}
"""


def clean_body(body):
    response = model.generate_content(EDITOR_PROMPT.format(body=body))
    return response.text.strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Write cleaned bodies to Firestore")
    args = parser.parse_args()

    documents = list(db.collection("featured_articles").stream())
    print(f"Found {len(documents)} featured article(s).")
    for document in documents:
        article = document.to_dict()
        original = article.get("body", "").strip()
        if not original:
            print(f"Skipping {document.id}: empty body")
            continue
        cleaned = clean_body(original)
        print(f"\n{article.get('headline', document.id)}\n{'-' * 60}\n{cleaned[:600]}\n")
        if args.apply:
            document.reference.update({"body": cleaned})
            print("Updated.")
        else:
            print("Preview only. Run again with --apply to save.")
        time.sleep(5)


if __name__ == "__main__":
    main()
