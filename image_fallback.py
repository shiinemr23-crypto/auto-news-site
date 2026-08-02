"""
Image fallback — searches Unsplash for a relevant, freely-licensed
photo when an article's RSS feed didn't provide its own thumbnail.
Never generates images (see project notes: AI-generated images next
to real news content risk being mistaken for real photographic
evidence) — only searches and links to real, licensed stock photos.

Deliberately avoids searching by named public figures: a stock photo
library isn't curated for "this is what X looks like right now," so a
search for a person's name can return an outdated or unrelated photo
next to current news — actively misleading rather than just missing.
Falls back to a generic topic category instead in that case.
"""

import os
import re
import requests
from dotenv import load_dotenv

load_dotenv()

UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY")
UNSPLASH_SEARCH_URL = "https://api.unsplash.com/search/photos"

# Keyword -> broad, Unsplash-friendly topic category. Checked in order;
# first match wins. This is what lets a hyper-specific headline like
# "Fighting breaks out in western Tigray as Ethiopia and TPLF..." still
# land a real photo, by searching "military conflict" instead of the
# specific named entities, which Unsplash's library won't have.
_TOPIC_CATEGORIES = [
    (r"\b(plane|aircraft|airline|aviation)\b.*\b(crash|crashes|crashed)\b", "airplane crash aviation accident"),
    (r"\b(crash|crashes|crashed)\b", "car accident emergency scene"),
    (r"\b(wildfire|wildfires|forest fire)\b", "wildfire forest fire"),
    (r"\b(earthquake|tremor)\b", "earthquake disaster rubble"),
    (r"\b(flood|flooding)\b", "flood disaster water"),
    (r"\b(shooting|shooter|gunman|gunmen)\b", "police emergency response"),
    (r"\b(bomb|bombing|explosion)\b", "emergency scene explosion aftermath"),
    (r"\b(war|conflict|fighting|clashes|militia|rebels)\b", "military conflict"),
    (r"\b(migrant|migrants|migration|refugee|refugees)\b", "migration border crossing"),
    (r"\b(election|vote|voting|ballot|senate|parliament)\b", "election voting government"),
    (r"\b(cyberattack|hacking|hacked|data breach)\b", "cybersecurity technology"),
    (r"\b(nuclear|reactor|power plant)\b", "power plant industrial energy"),
    (r"\b(economy|economic|market|markets|trade|tariff)\b", "stock market finance"),
    (r"\b(court|trial|lawsuit|subpoena|judge|legal)\b", "courtroom law justice"),
    (r"\b(protest|protesters|demonstration)\b", "protest demonstration crowd"),
    (r"\b(pipeline|oil|gas|energy deal)\b", "oil industry infrastructure"),
]

# Common news-headline words that carry no visual meaning — used to
# build a simplified query as a second-tier fallback.
_STOPWORDS = {
    "a", "an", "the", "of", "in", "on", "at", "to", "for", "and", "or",
    "as", "is", "are", "was", "were", "with", "after", "before", "amid",
    "over", "among", "between", "says", "say", "said", "than",
    "one", "year", "days", "day", "week", "up", "out", "his", "her",
    "their", "its", "who", "what", "why", "how", "report", "reports",
    "reporting",
}


def _looks_like_named_person_focus(text):
    """Rough heuristic: a headline that's mostly a capitalized name
    right at the start (e.g. "Donald Trump vows...", "Pedro Sánchez
    was...") is likely to search poorly and riskily on Unsplash. Not
    perfect, but good enough to trigger the safer topic-category path
    instead of a name search.
    """
    words = text.split()
    if len(words) < 2:
        return False
    # First two words both capitalized and alphabetic looks like "Firstname Lastname"
    first_two = words[:2]
    return all(w[0].isupper() and w.isalpha() for w in first_two if w)


def _topic_category_for(text):
    """Matches headline text against known topic patterns and returns
    a broad, Unsplash-friendly category string, or None if nothing matches.
    """
    lowered = text.lower()
    for pattern, category in _TOPIC_CATEGORIES:
        if re.search(pattern, lowered):
            return category
    return None


def _simplify_query(text):
    """Strips a news headline down to its most visually concrete
    words — drops stopwords, numbers, and punctuation, keeps the rest.
    """
    words = re.findall(r"[A-Za-z']+", text)
    keywords = [w for w in words if w.lower() not in _STOPWORDS and len(w) > 2]
    return " ".join(keywords[:5])


def search_image(query, orientation="landscape"):
    """Searches Unsplash for a photo matching `query`. Returns the
    image URL (regular size) on success, or None if no key is
    configured, no results found, or the request fails for any reason.
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


def search_image_with_fallback(headline):
    """Three-tier search strategy:
    1. A known broad topic category, if the headline matches one —
       tried FIRST, since it's both more reliable and safer than
       searching the specific headline (avoids named-person issues
       automatically for most news categories).
    2. The full headline, if no topic matched and it doesn't look
       like a named-person-focused headline.
    3. A simplified keyword version of the headline, as a last resort.
    """
    category = _topic_category_for(headline)
    if category:
        result = search_image(category)
        if result:
            return result

    if not _looks_like_named_person_focus(headline):
        result = search_image(headline)
        if result:
            return result

    simplified = _simplify_query(headline)
    if simplified:
        print(f"Retrying with simplified query: '{simplified}'")
        return search_image(simplified)

    return None


def ensure_image(article, fallback_query=None):
    """Takes an article dict. If it already has a non-empty 'image'
    field (e.g. from RSS extraction), leaves it untouched. Otherwise
    searches Unsplash using the tiered fallback strategy above.

    Mutates and returns the same article dict for convenient chaining.
    """
    if article.get("image"):
        return article  # RSS already gave us one, nothing to do

    query = fallback_query or article.get("title", "")
    article["image"] = search_image_with_fallback(query)
    return article


if __name__ == "__main__":
    test_article = {"title": "Wildfire spreads across coastal hills", "image": None}
    result = ensure_image(test_article)
    print("Image URL:", result["image"])
