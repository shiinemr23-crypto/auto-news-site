"""
Phase 2 — AI rewrite.
Takes a scraped article (title + summary) and asks Gemini to produce
a short, original-wording summary. Keep outputs SHORT and clearly
summary-style — this is what keeps the project in safe, educational
territory rather than reproducing source articles.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3.1-flash-lite")

REWRITE_PROMPT = """You are a neutral news summarizer.
Rewrite the following article summary in your own words, in 2-3 sentences.
Do not copy phrases directly. Stay factual and neutral in tone.

Title: {title}
Original summary: {summary}
"""


def rewrite_article(article):
    """Takes an article dict (from scrape.py) and returns it with
    an added 'rewritten' field.
    """
    prompt = REWRITE_PROMPT.format(
        title=article["title"],
        summary=article["summary"],
    )

    response = model.generate_content(prompt)

    article["rewritten"] = response.text.strip()
    return article


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
