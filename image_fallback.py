"""
Image fallback — searches Unsplash for a relevant, freely-licensed
photo when an article's RSS feed didn't provide its own thumbnail.
Never generates images (see project notes: AI-generated images next
to real news content risk being mistaken for real photographic
evidence) — only searches and links to real, licensed stock photos.
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY")
UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"


def search_image(query, orientation="landscape"):
    """Searches Unsplash for a photo matching `query`. Returns the
    image URL (regular size) on success, or None if no key is
    configured, no results found, or the request fails for any reason.

    Callers should always handle None gracefully — this is a best-
    effort enhancement, not a required step.
    """
    if not UNSPLASH_ACCESS_KEY:
        print("UNSPLASH_ACCESS_KEY not set, skipping image search.")
        return None

    try:
        response = requests.get(
            UNSPLASH_SEARCH_URL,
            params={"query": query, "orientation": orientation, "per_page": 1},
            headers={"Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"},
            timeout=10,
        )
        response.raise_for_status()
        results = response.json().get("results", [])
        if not results:
            return None
        return results[0]["urls"]["regular"]
    except Exception as e:
        print(f"Unsplash search failed for '{query}': {e}")
        return None


def ensure_image(article, fallback_query=None):
    """Takes an article dict. If it already has a non-empty 'image'
    field (e.g. from RSS extraction), leaves it untouched. Otherwise
    searches Unsplash using `fallback_query` (defaults to the
    article's title) and fills 'image' with the result, or leaves it
    as None if the search also comes up empty.

    Mutates and returns the same article dict for convenient chaining.
    """
    if article.get("image"):
        return article  # RSS already gave us one, nothing to do

    query = fallback_query or article.get("title", "")
    article["image"] = search_image(query)
    return article


if __name__ == "__main__":
    # Quick manual test.
    test_article = {"title": "Wildfire spreads across coastal hills", "image": None}
    result = ensure_image(test_article)
    print("Image URL:", result["image"])
