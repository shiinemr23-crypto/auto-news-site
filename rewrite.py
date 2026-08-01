"""
Phase 2 — AI rewrite.
Takes a scraped article and asks Gemini to produce an original-wording
summary. When the full source article text is available (see
fetch_full_text.py), produces a longer, multi-paragraph summary
genuinely grounded in that content. When only the short RSS blurb is
available, falls back to a brief summary and explicitly avoids
inventing specifics — this fallback path is what keeps the project
safe even when full-text extraction fails for a given source.
"""

import os
import time
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3.1-flash-lite")

# Free tier allows 15 requests/minute for this model.
# Spacing calls out avoids hitting the limit in the first place.
SECONDS_BETWEEN_CALLS = 5

# Used when full article text was successfully extracted.
# Genuinely longer and multi-paragraph, but still grounded in real
# reported content rather than invented detail.
FULL_TEXT_PROMPT = """You are a neutral news summarizer.
Summarize the following article in your own words, in 3-4 short
paragraphs. Do not copy sentences directly — rewrite everything in
your own words. Stay factual and neutral in tone. Only include facts,
figures, and claims that actually appear in the article text below —
do not add outside information or speculation.

Naturally attribute the information within the text itself, e.g.
"According to {source}, ..." — work this in early, not as a label.
End with a final short paragraph in this exact format:
"Source: {source} — {link}"

Title: {title}
Article text: {full_text}
"""

# Used when only the short RSS blurb is available (full-text
# extraction failed or wasn't attempted). Deliberately stays brief
# and avoids inventing specifics not present in the blurb.
SUMMARY_ONLY_PROMPT = """You are a neutral news summarizer.
Rewrite the following article summary in your own words, in 5-6 sentences.
Do not copy phrases directly. Stay factual and neutral in tone.

You are only given a short summary, not the full article. Do not invent
specific facts, numbers, quotes, or details that aren't in the summary
below. Instead add value by: explaining relevant background context,
clarifying why this matters, or noting what typically happens next in
situations like this — general, defensible context, not invented specifics.

Naturally attribute the information within the text itself, e.g.
"According to {source}, ..." — work this in early, not as a label.
End with a final short sentence in this exact format:
"Source: {source} — {link}"

Title: {title}
Original summary: {summary}
"""


def rewrite_article(article, max_retries=3):
    """Takes an article dict (from scrape.py, optionally with a
    'full_text' field added by fetch_full_text.py) and returns it
    with an added 'rewritten' field. Retries with backoff if the
    free-tier rate limit is hit.
    """
    full_text = article.get("full_text")

    if full_text and len(full_text) > 200:
        # Enough real content to work with — produce a longer summary.
        prompt = FULL_TEXT_PROMPT.format(
            title=article["title"],
            full_text=full_text[:8000],  # cap to keep prompt size sane
            source=article["source"],
            link=article["link"],
        )
    else:
        # No usable full text — stay brief and don't invent specifics.
        prompt = SUMMARY_ONLY_PROMPT.format(
            title=article["title"],
            summary=article["summary"],
            source=article["source"],
            link=article["link"],
        )

    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            article["rewritten"] = response.text.strip()
            time.sleep(SECONDS_BETWEEN_CALLS)  # pace the next call
            return article
        except ResourceExhausted:
            wait = 60  # free tier resets per minute; wait it out
            print(f"Rate limit hit, waiting {wait}s (attempt {attempt + 1}/{max_retries})...")
            time.sleep(wait)

    raise RuntimeError(f"Failed to rewrite '{article['title']}' after {max_retries} retries")


if __name__ == "__main__":
    # Quick manual test using one fake article.
    test_article = {
        "title": "Example headline",
        "summary": "This is a placeholder summary to test the rewrite step.",
        "link": "https://example.com",
        "source": "Test Feed",
    }

    result = rewrite_article(test_article)
    print("Original:", result["summary"])
    print("\nRewritten:", result["rewritten"])
