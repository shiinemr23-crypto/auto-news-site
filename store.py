"""
Phase 3 — storage.
Saves rewritten articles into Firestore. Uses the article link as the
document ID so re-running the pipeline won't create duplicates.
"""

import os
import json
import hashlib
from datetime import datetime, timezone

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()


def _load_credentials():
    """Loads Firebase credentials two ways:
    - Locally: from a JSON file path (FIREBASE_SERVICE_ACCOUNT_PATH)
    - In GitHub Actions: from the full JSON contents as a secret
      (FIREBASE_SERVICE_ACCOUNT_JSON)
    """
    json_str = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if json_str:
        cred_dict = json.loads(json_str)
        return credentials.Certificate(cred_dict)

    cred_path = os.environ["FIREBASE_SERVICE_ACCOUNT_PATH"]
    return credentials.Certificate(cred_path)


if not firebase_admin._apps:
    cred = _load_credentials()
    firebase_admin.initialize_app(cred)

db = firestore.client()


def _doc_id_for(link):
    """Stable, short doc ID derived from the article link."""
    return hashlib.sha256(link.encode("utf-8")).hexdigest()[:20]


def save_article(article):
    """Saves one rewritten article dict to the 'articles' collection.
    Skips if it already exists (dedup by link).
    """
    doc_id = _doc_id_for(article["link"])
    doc_ref = db.collection("articles").document(doc_id)

    if doc_ref.get().exists:
        return False  # already stored, skip

    doc_ref.set({
        "title": article["title"],
        "rewritten": article["rewritten"],
        "source": article["source"],
        "link": article["link"],
        "published": article.get("published", ""),
        "image": article.get("image"),
        "created_at": datetime.now(timezone.utc),
    })
    return True


if __name__ == "__main__":
    # Quick manual test using one fake rewritten article.
    test_article = {
        "title": "Example headline",
        "rewritten": "This is a placeholder rewritten summary.",
        "link": "https://example.com/test-article",
        "source": "Test Feed",
        "published": "",
    }

    saved = save_article(test_article)
    print("Saved new doc" if saved else "Already existed, skipped")
