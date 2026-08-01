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
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    "https://www.theguardian.com/world/rss",
    "https://www.aljazeera.com/xml/rss/all.xml",
    "https://feeds.npr.org/1001/rss.xml",
]


def _extract_image(entry):
    """Best-effort extraction of a thumbnail/image URL from an RSS entry.
    Different feeds put images in different places, so we check several
    common locations. Returns None if no image is found — the frontend
    can fall back to a text-only card in that case.
    """
    # Most common: media:content or media:thumbnail (Guardian, Al Jazeera, etc.)
    if getattr(entry, "media_content", None):
        for media in entry.media_content:
            if media.get("url"):
                return media["url"]

    if getattr(entry, "media_thumbnail", None):
        for thumb in entry.media_thumbnail:
            if thumb.get("url"):
                return thumb["url"]

    # Some feeds (BBC) use enclosure links for images
    if getattr(entry, "links", None):
        for link in entry.links:
            if link.get("type", "").startswith("image/"):
                return link.get("href")

    return None


def _published_datetime(entry):
    """Best-effort parse of an entry's published time into a UTC datetime.
    Returns None if the feed doesn't provide a parseable date.
    """
    if getattr(entry, "published_parsed", None):
        return datetime.fromtimestamp(mktime(entry.published_parsed), tz=timezone.utc)
    return None


def fetch_all_articles(max_per_feed=4):
    """Pulls articles from every feed in RSS_FEEDS with no time filtering
    at all — this always returns whatever each feed currently lists as
    its latest items, regardless of publish date.

    Returns a list of dicts: title, summary, link, published, source, image.
    """
    articles = []

    for feed_url in RSS_FEEDS:
        parsed = feedparser.parse(feed_url)

        for entry in parsed.entries[:max_per_feed]:
            articles.append({
                "title": entry.get("title", ""),
                "summary": entry.get("summary", ""),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "source": parsed.feed.get("title", feed_url),
                "image": _extract_image(entry),
                "_published_dt": _published_datetime(entry),
            })

    return articles


def filter_recent(articles, max_age_minutes=90):
    """Filters an already-fetched article list down to ones published
    within the last `max_age_minutes`. Articles with no parseable
    published date are kept (better to check-and-skip via dedup in
    store.py than silently drop them here).
    """
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=max_age_minutes)
    return [
        a for a in articles
        if a["_published_dt"] is None or a["_published_dt"] >= cutoff
    ]


def fetch_articles(max_per_feed=4, max_age_minutes=90):
    """Convenience wrapper: fetch everything, then filter to recent.
    This is what main.py uses for normal hourly runs. For debugging
    or one-off backfills, call fetch_all_articles() and filter_recent()
    separately instead.
    """
    all_articles = fetch_all_articles(max_per_feed=max_per_feed)
    return filter_recent(all_articles, max_age_minutes=max_age_minutes)


if __name__ == "__main__":
    # Quick manual test: run `python scrape.py` to see it working.
    all_results = fetch_all_articles()
    recent_results = filter_recent(all_results)

    print(f"Fetched {len(all_results)} total articles")
    print(f"Of those, {len(recent_results)} are within the recent-news window\n")

    for a in all_results:
        tag = "[recent]" if a in recent_results else "[older] "
        print(f"{tag} [{a['source']}] {a['title']}")
        print(f"          {a['link']}\n")
