"""
Orchestrator for the long-form "featured articles" pipeline — separate
from main.py's hourly per-article summaries. This one:
  1. scrape.py         -> fetch fresh articles from all sources
  2. trend_detect.py   -> cluster into genuinely multi-source trending topics
  3. synthesize.py      -> write one long, cited, multi-source article per topic
  4. store_features.py -> save to the separate 'featured_articles' collection

Meant to run every few hours (not hourly) via its own GitHub Actions
schedule — a topic is either trending or it isn't; running this hourly
would just waste API calls re-checking the same slow-moving story.

Limits itself to publishing at most MAX_PER_RUN new features per run,
and skips topics on days that already have enough features, to keep
volume low and each piece meaningful rather than flooding the site.
"""

from datetime import datetime, timezone, timedelta

from scrape import fetch_all_articles
from trend_detect import find_trending_clusters
from synthesize import synthesize_article
from store_features import save_feature_article, already_saved_feature, db

MAX_PER_RUN = 1        # publish at most 1 new feature per run
MAX_PER_DAY = 3         # soft daily cap across all runs


def _features_published_today():
    """Counts featured_articles created in the last 24 hours, so we
    don't blow past the daily cap even across multiple scheduled runs.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    query = db.collection("featured_articles").where("created_at", ">=", cutoff)
    return len(list(query.stream()))


def run_features_pipeline():
    already_today = _features_published_today()
    print(f"Features published in the last 24h: {already_today}")

    if already_today >= MAX_PER_DAY:
        print(f"Daily cap of {MAX_PER_DAY} reached, skipping this run.")
        return

    articles = fetch_all_articles(max_per_feed=8)
    print(f"Fetched {len(articles)} articles for trend analysis")

    clusters = find_trending_clusters(articles)
    print(f"Found {len(clusters)} genuinely trending clusters")

    published_this_run = 0
    for cluster in clusters:
        if published_this_run >= MAX_PER_RUN:
            break
        if already_today + published_this_run >= MAX_PER_DAY:
            print("Daily cap reached mid-run, stopping.")
            break

        if already_saved_feature(cluster["topic_label"]):
            print(f"Skipped (already covered): {cluster['topic_label']}")
            continue

        try:
            article = synthesize_article(cluster)
            saved = save_feature_article(article)
            if saved:
                published_this_run += 1
                print(f"Published: {article['headline']}")
        except Exception as e:
            print(f"Error synthesizing '{cluster['topic_label']}': {e}")

    print(f"\nDone. {published_this_run} new featured article(s) published.")


if __name__ == "__main__":
    run_features_pipeline()
