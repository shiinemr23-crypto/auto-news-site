"""
Long-form synthesis — Phase B of the long-form pipeline.
Takes one trending cluster (multiple articles from different outlets,
all about the same real story) and produces a single long, original
article that cites each source specifically, adds genuine background
context, and has its own AI-generated headline.

This is fundamentally different from rewrite.py's per-article summary:
it has real multi-source material to work with, so length and depth
here are earned, not invented.
"""

import os
import time
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from dotenv import load_dotenv

from fetch_full_text import fetch_full_text
from image_fallback import ensure_image

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3.1-flash-lite")

SECONDS_BETWEEN_CALLS = 5

SYNTHESIS_PROMPT = """You are a careful, neutral news writer producing
a long-form synthesis article about a story multiple outlets are
covering. You have been given the full text from several different
sources below, each labeled with its outlet name and link.

Write a long-form article (6-10 paragraphs) that:
- Synthesizes what these sources are reporting, in your own words —
  never copy sentences directly from any source
- Reads as clean, flowing prose. Do NOT write inline attribution
  phrases like "According to BBC..." or "The Guardian reports..."
  inside sentences — this breaks up the writing and gets repetitive.
- Instead, end EVERY paragraph with a short citation line noting which
  outlet(s) that paragraph's information came from, in this exact
  format on its own line: "(Source: BBC, The Guardian)" — list only
  the outlets actually used in that specific paragraph, using their
  outlet names exactly as given below.
- Notes where sources disagree or emphasize different details — when
  this happens, name which outlet says what directly in the prose
  (this is the one case where naming a source mid-paragraph is fine,
  since the disagreement itself is the point), still followed by the
  end-of-paragraph citation line.
- Adds genuine background context to help the reader understand why
  this matters — but ONLY general, defensible context (history,
  typical process, wider significance), never invented specific facts,
  numbers, or claims not present in the source texts below. A
  background paragraph with no source citation line is fine if it's
  general context rather than sourced fact.

Formatting requirements (strict):
- Separate every paragraph with a blank line (two newline characters)
  between paragraphs. Never write two paragraphs back to back with only
  a single line break.
- Keep each paragraph focused on one idea — aim for 3-5 sentences per
  paragraph, not long dense blocks.
- Every paragraph's citation line "(Source: ...)" goes on its own line
  directly after that paragraph's text, before the blank line that
  separates it from the next paragraph.

Also write a short, original headline for this piece (do not copy any
source's headline) as the very first line, prefixed with "HEADLINE: ".

Topic: {topic_label}

Sources:
{source_texts}
"""


def _format_sources(articles_with_text):
    blocks = []
    for a in articles_with_text:
        text = a.get("full_text") or a.get("summary", "")
        blocks.append(f"--- {a['source']} ({a['link']}) ---\n{text[:4000]}")
    return "\n\n".join(blocks)


def synthesize_article(cluster, max_retries=3):
    """Takes a cluster dict (from trend_detect.py: topic_label + articles)
    and returns a dict ready for storage: headline, body, sources list.

    Fetches full text for each article in the cluster first, then asks
    Gemini to synthesize across all of them.
    """
    articles = cluster["articles"]

    for article in articles:
        article["full_text"] = fetch_full_text(article["link"])
        time.sleep(1)  # be polite to source servers

    prompt = SYNTHESIS_PROMPT.format(
        topic_label=cluster["topic_label"],
        source_texts=_format_sources(articles),
    )

    raw = None
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            raw = response.text.strip()
            break
        except ResourceExhausted:
            wait = 60
            print(f"Rate limit hit, waiting {wait}s (attempt {attempt + 1}/{max_retries})...")
            time.sleep(wait)

    if raw is None:
        raise RuntimeError(f"Failed to synthesize '{cluster['topic_label']}' after {max_retries} retries")

    headline = cluster["topic_label"]
    body = raw
    if raw.upper().startswith("HEADLINE:"):
        first_line, _, rest = raw.partition("\n")
        headline = first_line.split(":", 1)[1].strip()
        body = rest.strip()

    # The "Sources:" section is already available in structured form
    # below (built from `articles`, not parsed from Gemini's text), so
    # strip the trailing plain-text version to avoid showing it twice.
    if "Sources:" in body:
        body = body.split("Sources:")[0].strip()

    # Use an image already found in one of the source articles (from
    # RSS) if any exists; otherwise fall back to an Unsplash search
    # using the new headline as the query.
    image = next((a.get("image") for a in articles if a.get("image")), None)
    result = {
        "headline": headline,
        "body": body,
        "topic_label": cluster["topic_label"],
        "sources": [{"name": a["source"], "link": a["link"]} for a in articles],
        "image": image,
    }
    return ensure_image(result, fallback_query=headline)


if __name__ == "__main__":
    # Quick manual test — requires real, currently-live article URLs to
    # be meaningful, so this is a light smoke test rather than a full check.
    test_cluster = {
        "topic_label": "Test topic",
        "articles": [
            {"source": "Test Source", "link": "https://example.com", "summary": "A short test summary."},
        ],
    }
    result = synthesize_article(test_cluster)
    print("Headline:", result["headline"])
    print("\nBody:\n", result["body"])
