"""
Phase 1 — RSS ingestion.
Pulls latest articles from a list of RSS feeds and returns them as
a clean list of dicts, ready for the rewrite step (Phase 2).
"""

import feedparser

# Start with a couple of well-known, reliable RSS feeds.
# Add more once this works end to end.
RSS_FEEDS = [
    "http://feeds.bbci.co.uk/news/rss.xml",
    "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
]


def fetch_articles(max_per_feed=5):
    """Fetch recent articles from each feed in RSS_FEEDS.

    Returns a list of dicts: title, summary, link, published, source.
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
            })

    return articles


if __name__ == "__main__":
    # Quick manual test: run `python scrape.py` to see it working.
    results = fetch_articles()
    print(f"Fetched {len(results)} articles\n")
    for a in results:
        print(f"- [{a['source']}] {a['title']}")
        print(f"  {a['link']}\n")
