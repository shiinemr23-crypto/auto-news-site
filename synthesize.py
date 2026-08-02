"""Long-form synthesis for multi-source featured articles."""

import os
import re
import time
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted
from dotenv import load_dotenv

from fetch_full_text import fetch_full_text
from image_fallback import ensure_images

load_dotenv()
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3.1-flash-lite")

SYNTHESIS_PROMPT = """You are a careful, neutral news writer producing a long-form synthesis article about a story multiple outlets are covering. You have been given full text from several sources below.

Write a long-form article of 6-10 paragraphs that:
- Synthesizes the reporting in original language; never copy source sentences.
- Reads as clean, flowing magazine prose with natural transitions.
- Never use repetitive attribution phrasing in the body: do not write “according to”, “X reports”, “as reported by”, “per reporting from”, “X noted”, or similar constructions.
- Do not add source citations, source labels, footnotes, parenthetical source mentions, or a "Sources:" section anywhere in the body. The frontend displays the supplied, verified source links once at the end of the article.
- If the supplied reports disagree, describe the uncertainty or difference directly and neutrally without naming an outlet.
- Adds only defensible background context. Do not invent facts, numbers, quotes, or claims not present in the supplied text.

Formatting requirements:
- Separate every paragraph with one blank line.
- Keep paragraphs focused on one idea, around 3-5 sentences each.
- Return only a headline as the first line, prefixed with "HEADLINE: ", followed by the article prose. Do not include any other headings or source list.

Topic: {topic_label}

Sources:
{source_texts}
"""


def _format_sources(articles_with_text):
    blocks = []
    for article in articles_with_text:
        text = article.get("full_text") or article.get("summary", "")
        blocks.append(f"--- {article['source']} ({article['link']}) ---\n{text[:4000]}")
    return "\n\n".join(blocks)


def _clean_body(body):
    """Defensively remove legacy citation lines if a model emits them."""
    body = re.split(r"(?im)^\s*sources:\s*$", body, maxsplit=1)[0]
    body = re.sub(r"(?im)^\s*\(?source:\s*[^\n]+\)?\s*$", "", body)
    return re.sub(r"\n{3,}", "\n\n", body).strip()


def synthesize_article(cluster, max_retries=3):
    """Produce a featured article ready for structured Firestore storage."""
    articles = cluster["articles"]
    for article in articles:
        article["full_text"] = fetch_full_text(article["link"])
        time.sleep(1)

    prompt = SYNTHESIS_PROMPT.format(topic_label=cluster["topic_label"], source_texts=_format_sources(articles))
    raw = None
    for attempt in range(max_retries):
        try:
            raw = model.generate_content(prompt).text.strip()
            break
        except ResourceExhausted:
            wait = 60
            print(f"Rate limit hit, waiting {wait}s (attempt {attempt + 1}/{max_retries})...")
            time.sleep(wait)
    if raw is None:
        raise RuntimeError(f"Failed to synthesize '{cluster['topic_label']}' after {max_retries} retries")

    headline, body = cluster["topic_label"], raw
    if raw.upper().startswith("HEADLINE:"):
        first_line, _, body = raw.partition("\n")
        headline = first_line.split(":", 1)[1].strip()
    body = _clean_body(body)
    image = next((article.get("image") for article in articles if article.get("image")), None)
    result = {
        "headline": headline,
        "body": body,
        "topic_label": cluster["topic_label"],
        "sources": [{"name": article["source"], "link": article["link"]} for article in articles],
        "image": image,
    }
    return ensure_images(result, fallback_query=headline)
