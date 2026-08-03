"""
Trend detection — Phase A of the long-form pipeline.
Takes a batch of freshly scraped articles from multiple sources and
asks Gemini to group them into clusters of "same real-world story,
covered by multiple outlets." This is what lets us tell the difference
between "everyone's covering this" (genuinely trending) and "one outlet
happened to publish this" (not trending).
"""

import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3.1-flash-lite")

# A cluster needs coverage from at least this many distinct sources
# to count as "trending" — one outlet covering something on its own is
# just normal news, not a hot topic worth a long synthesis piece.
# Set to 2 (not 3) since the source pool is only 5 outlets total —
# requiring 3 was too strict and rarely triggered in practice.
MIN_SOURCES_FOR_TRENDING = 2

CLUSTER_PROMPT = """You will be given a numbered list of news headlines
from different outlets, collected within the same short time window.

Group the headlines that are about the SAME real-world story or event,
even if worded differently by different outlets. Ignore headlines that
don't clearly match any other headline — leave those out entirely.

Respond with ONLY valid JSON, no other text, no markdown formatting.
Format:
{{
  "clusters": [
    {{"indices": [0, 3, 7], "topic_label": "short 4-8 word description of the shared story"}}
  ]
}}

Headlines:
{headline_list}
"""


def _format_headlines(articles):
    lines = []
    for i, article in enumerate(articles):
        lines.append(f"{i}. [{article['source']}] {article['title']}")
    return "\n".join(lines)


def find_trending_clusters(articles, min_sources=MIN_SOURCES_FOR_TRENDING):
    """Takes a list of scraped articles (from scrape.py) and returns
    only the clusters that have coverage from at least `min_sources`
    distinct outlets — i.e. genuinely trending topics.

    Returns a list of dicts: {"topic_label": str, "articles": [article dicts]}
    """
    if len(articles) < min_sources:
        return []  # not enough articles to possibly form a trending cluster

    prompt = CLUSTER_PROMPT.format(headline_list=_format_headlines(articles))
    response = model.generate_content(prompt)

    raw = response.text.strip()
    # Gemini sometimes wraps JSON in markdown fences despite instructions
    if raw.startswith("```"):
        raw = raw.strip("`").removeprefix("json").strip()

    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        print(f"Failed to parse cluster response as JSON: {raw[:200]}")
        return []

    trending = []
    for cluster in parsed.get("clusters", []):
        indices = cluster.get("indices", [])
        cluster_articles = [articles[i] for i in indices if i < len(articles)]

        distinct_sources = {a["source"] for a in cluster_articles}
        if len(distinct_sources) >= min_sources:
            trending.append({
                "topic_label": cluster.get("topic_label", "Untitled topic"),
                "articles": cluster_articles,
            })

    return trending


if __name__ == "__main__":
    # Quick manual test with fake headlines simulating multi-source coverage.
    test_articles = [
        {"source": "BBC", "title": "Major earthquake strikes coastal region"},
        {"source": "Guardian", "title": "Thousands displaced after coastal earthquake"},
        {"source": "Al Jazeera", "title": "Earthquake death toll rises in coastal towns"},
        {"source": "NPR", "title": "Local election results announced"},
        {"source": "WSJ", "title": "Markets react to earthquake in coastal region"},
    ]

    results = find_trending_clusters(test_articles, min_sources=3)
    for cluster in results:
        print(f"\nTrending: {cluster['topic_label']}")
        for a in cluster["articles"]:
            print(f"  - [{a['source']}] {a['title']}")
