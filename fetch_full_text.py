"""
Fetches the full readable text of an article from its source URL,
so rewrite.py has real reported content to summarize from instead of
just a 1-3 sentence RSS blurb. This is what makes genuinely longer,
multi-paragraph summaries possible without inventing facts.

Uses trafilatura, which extracts the main article text from a page
and strips out navigation, ads, and other boilerplate.
"""

import trafilatura


def fetch_full_text(url, timeout=10):
    """Downloads and extracts the main article text from a URL.
    Returns the extracted text as a string, or None if extraction
    failed (paywall, network error, unusual page structure, etc.).

    Callers should always handle None gracefully — rewrite.py falls
    back to the short RSS summary when this returns nothing.
    """
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded is None:
            return None

        text = trafilatura.extract(downloaded, include_comments=False, include_tables=False)
        return text
    except Exception as e:
        print(f"Full-text fetch failed for {url}: {e}")
        return None


if __name__ == "__main__":
    # Quick manual test with a real URL.
    test_url = "https://www.bbc.com/news"
    result = fetch_full_text(test_url)
    if result:
        print(f"Extracted {len(result)} characters:\n")
        print(result[:500])
    else:
        print("Extraction failed or returned nothing.")
