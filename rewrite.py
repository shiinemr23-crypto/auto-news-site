"""
Phase 2 — AI rewrite.
Takes a scraped article (title + summary) and asks Gemini to produce
a short, original-wording summary. Keep outputs SHORT and clearly
summary-style — this is what keeps the project in safe, educational
territory rather than reproducing source articles.
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

REWRITE_PROMPT = """You are a neutral news summarizer.
Rewrite the following article summary in your own words, in 2-3 sentences.
Do not copy phrases directly. Stay factual and neutral in tone.

Naturally attribute the information within the text itself, e.g.
"According to {source}, ..." — work this in early, not as a label.
End with a final short sentence in this exact format:
"Source: {source} — {link}"

Title: {title}
Original summary: {summary}
"""


def rewrite_article(article, max_retries=3):
    """Takes an article dict (from scrape.py) and returns it with
    an added 'rewritten' field. Retries with backoff if the free-tier
    rate limit is hit.
    """
    prompt = REWRITE_PROMPT.format(
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
