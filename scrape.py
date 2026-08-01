"""
Phase 1 — RSS ingestion.
Pulls latest articles from a list of RSS feeds and returns them as
a clean list of dicts, ready for the rewrite step (Phase 2).
"""

import feedparser
from datetime import datetime, timezone, timedelta
from time import mktime

# A mix of general and topic feeds — more sources means more chance
# of catching genuinely new articles each hourly run.
RSS_FEEDS = [
    "http://feeds.bbci.co.uk/news/rss.xml",
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "http://feeds.bbci.co.uk/news/technology/rss.xml",
    "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    "https://www.theguardian.com/world/rss",
    "https://www.aljazeera.com/xml/rss/all.xml",
]


def _published_datetime(entry):
    """Best-effort parse of an entry's published time into a UTC datetime.
    Returns None if the feed doesn't provide a parseable date.
    """
    if getattr(entry, "published_parsed", None):
        return datetime.fromtimestamp(mktime(entry.published_parsed), tz=timezone.utc)
    return None


def fetch_articles(max_per_feed=4, max_age_minutes=90):
    """Fetch recent articles from each feed in RSS_FEEDS, keeping only
    ones published within the last `max_age_minutes`. The 90-minute
    default gives a buffer past the hourly schedule in case a run
    starts a bit late.

    Articles with no parseable published date are kept anyway (better
    to check-and-skip in store.py than silently drop them).

    Returns a list of dicts: title, summary, link, published, source.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=max_age_minutes)
    articles = []

    for feed_url in RSS_FEEDS:
        parsed = feedparser.parse(feed_url)

        for entry in parsed.entries[:max_per_feed]:
            pub_dt = _published_datetime(entry)

            if pub_dt is not None and pub_dt < cutoff:
                continue  # too old, skip before it ever reaches Gemini

            articles.append({
                "title": entry.get("title", ""),
                "summary": entry.get("summary", ""),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "source": parsed.feed.get("title", feed_url),
            })

    return articles


if __name__ == "__main__":
    # Quick manual test: run `python scrape.py` to see it working.
    results = fetch_articles()
    print(f"Fetched {len(results)} articles\n")
    for a in results:
        print(f"- [{a['source']}] {a['title']}")
        print(f"  {a['link']}\n")
