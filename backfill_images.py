"""
One-time backfill — finds existing documents in both 'articles' and
'featured_articles' that have image == None, and fills them in using
the same Unsplash fallback logic new articles get automatically.

Run manually once: python backfill_images.py
Safe to re-run — it only touches documents that still have no image,
so running it twice does no harm and costs no extra API calls on
already-fixed documents.
"""

import time
from store import db
from image_fallback import search_image


def backfill_collection(collection_name, title_field):
    """Finds docs in `collection_name` with image == None, searches
    Unsplash using their `title_field` value, and updates them in
    place. Returns the number of documents updated.
    """
    docs = db.collection(collection_name).where("image", "==", None).stream()
    docs = list(docs)
    print(f"\n{collection_name}: {len(docs)} document(s) with no image")

    updated = 0
    for doc in docs:
        data = doc.to_dict()
        query = data.get(title_field, "")
        if not query:
            print(f"  Skipping {doc.id} — no '{title_field}' field to search with")
            continue

        image_url = search_image(query)
        if image_url:
            doc.reference.update({"image": image_url})
            updated += 1
            print(f"  Updated: {query[:60]}")
        else:
            print(f"  No image found for: {query[:60]}")

        time.sleep(1)  # be polite to the Unsplash API

    return updated


if __name__ == "__main__":
    total = 0
    total += backfill_collection("articles", "title")
    total += backfill_collection("featured_articles", "headline")
    print(f"\nDone. {total} document(s) updated with a new image.")
