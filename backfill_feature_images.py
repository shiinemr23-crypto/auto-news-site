"""Populate up to three real stock images on existing featured articles."""

from image_fallback import ensure_images
from store import db


def main():
    updated = 0
    for document in db.collection("featured_articles").stream():
        article = document.to_dict()
        enriched = ensure_images({"image": article.get("image"), "images": article.get("images", [])}, fallback_query=article.get("headline", ""))
        if enriched["images"] != article.get("images", []) or enriched["image"] != article.get("image"):
            document.reference.update({"image": enriched["image"], "images": enriched["images"]})
            updated += 1
            print(f"Updated {document.id} with {len(enriched['images'])} image(s).")
    print(f"Backfilled {updated} featured article(s).")


if __name__ == "__main__":
    main()
