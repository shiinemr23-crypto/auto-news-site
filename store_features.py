"""
Storage for long-form synthesized articles — saves to a separate
'featured_articles' Firestore collection, distinct from the hourly
'articles' collection used by the summary pipeline. Kept separate
because the two content types have different shapes (headline vs
title, sources array vs single source, body vs rewritten) and the
frontend will want to display them differently.
"""

import hashlib
import re
from datetime import datetime, timezone

# Reuses the same Firebase app initialization as store.py — importing
# db from there avoids initializing firebase_admin twice.
from store import db


def _slugify(headline):
    slug = re.sub(r"[^a-z0-9]+", "-", headline.lower()).strip("-")[:80]
    return slug or "featured-story"


def _unique_slug(headline):
    base = _slugify(headline)
    slug, suffix = base, 2
    while list(db.collection("featured_articles").where("slug", "==", slug).limit(1).stream()):
        slug = f"{base}-{suffix}"
        suffix += 1
    return slug


def _doc_id_for(topic_label):
    """Stable doc ID derived from the topic label, so re-running
    detection on the same trending topic within a short window
    doesn't create duplicate featured articles.
    """
    return hashlib.sha256(topic_label.encode("utf-8")).hexdigest()[:20]


def already_saved_feature(topic_label):
    doc_id = _doc_id_for(topic_label)
    return db.collection("featured_articles").document(doc_id).get().exists


def save_feature_article(article):
    """Saves one synthesized long-form article dict (from synthesize.py)
    to the 'featured_articles' collection. Skips if a feature on the
    same topic label already exists.
    """
    doc_id = _doc_id_for(article["topic_label"])
    doc_ref = db.collection("featured_articles").document(doc_id)

    if doc_ref.get().exists:
        return False

    doc_ref.set({
        "headline": article["headline"],
        "slug": _unique_slug(article["headline"]),
        "body": article["body"],
        "topic_label": article["topic_label"],
        "sources": article["sources"],  # list of {name, link}
        "image": article.get("image"),
        "images": article.get("images", []),
        "created_at": datetime.now(timezone.utc),
    })
    return True


if __name__ == "__main__":
    test_article = {
        "headline": "Test long-form headline",
        "body": "This is a placeholder long-form body.",
        "topic_label": "Test topic for storage check",
        "sources": [{"name": "Test Source", "link": "https://example.com"}],
    }

    saved = save_feature_article(test_article)
    print("Saved new feature doc" if saved else "Already existed, skipped")
