"""Backfill readable URL slugs for existing featured articles."""

from store_features import _unique_slug, db


def main():
    updated = 0
    for document in db.collection("featured_articles").stream():
        article = document.to_dict()
        if article.get("slug"):
            continue
        slug = _unique_slug(article.get("headline", "featured-story"))
        document.reference.update({"slug": slug})
        updated += 1
        print(f"{document.id} -> {slug}")
    print(f"Backfilled {updated} featured article(s).")


if __name__ == "__main__":
    main()
