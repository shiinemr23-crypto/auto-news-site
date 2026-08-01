"""
Orchestrator — runs the full pipeline:
  1. scrape.py   -> fetch latest RSS articles
  2. rewrite.py  -> rewrite each with Gemini
  3. store.py    -> save to Firestore (skips duplicates)

This is the script GitHub Actions will call on a schedule (Phase 4).
"""

from scrape import fetch_articles
from rewrite import rewrite_article
from store import save_article


def run_pipeline():
    articles = fetch_articles()
    print(f"Fetched {len(articles)} articles")

    new_count = 0
    for article in articles:
        try:
            article = rewrite_article(article)
            saved = save_article(article)
            if saved:
                new_count += 1
                print(f"Saved: {article['title']}")
            else:
                print(f"Skipped (duplicate): {article['title']}")
        except Exception as e:
            # Don't let one bad article kill the whole run.
            print(f"Error processing '{article.get('title', '?')}': {e}")

    print(f"\nDone. {new_count} new articles saved.")


if __name__ == "__main__":
    run_pipeline()
