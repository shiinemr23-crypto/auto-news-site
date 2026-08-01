"""
Orchestrator — runs the full pipeline:
  1. scrape.py           -> fetch latest RSS articles
  2. fetch_full_text.py  -> fetch full article text when possible
  3. rewrite.py           -> rewrite each with Gemini (longer if full text available)
  4. image_fallback.py   -> fill in an image if RSS didn't provide one
  5. store.py             -> save to Firestore (skips duplicates)

Runs every 8 hours via GitHub Actions, capped at MAX_PER_RUN new
articles per run — 4 per run x 3 runs/day = 12 regular articles/day.
"""

from scrape import fetch_articles
from fetch_full_text import fetch_full_text
from rewrite import rewrite_article
from image_fallback import ensure_image
from store import save_article, already_saved

MAX_PER_RUN = 4


def run_pipeline():
    articles = fetch_articles()
    print(f"Fetched {len(articles)} articles")

    new_count = 0
    for article in articles:
        if new_count >= MAX_PER_RUN:
            print(f"Reached cap of {MAX_PER_RUN} for this run, stopping.")
            break

        try:
            if already_saved(article["link"]):
                print(f"Skipped (duplicate): {article['title']}")
                continue

            article["full_text"] = fetch_full_text(article["link"])
            article = rewrite_article(article)
            article = ensure_image(article)
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
