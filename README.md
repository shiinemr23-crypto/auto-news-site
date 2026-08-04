# Auto News Site 

Scrapes RSS feeds, rewrites articles with Gemini, stores them in Firestore.


## Setup

1. **Create a virtual environment**
   ```
   python -m venv venv
   venv\Scripts\activate      (Windows)
   source venv/bin/activate   (Mac/Linux)
   ```

2. **Install dependencies**
   ```
   pip install -r requirements.txt
   ```

3. **Set up Firebase**
   - Create a Firebase project (console.firebase.google.com)
   - Enable Firestore (test mode is fine to start)
   - Project settings -> Service accounts -> Generate new private key
   - Save the downloaded JSON as `firebase-service-account.json` in this folder
     (already in `.gitignore` — it will never be committed)

4. **Get a Gemini API key**
   - https://aistudio.google.com/app/apikey

5. **Set up your .env file**
   ```
   copy .env.example .env      (Windows)
   cp .env.example .env        (Mac/Linux)
   ```
   Then open `.env` and fill in your real `GEMINI_API_KEY`.

## Run it

Test each phase individually first:
```
python scrape.py     # just fetches and prints headlines
python rewrite.py    # tests rewriting one fake article
python store.py      # tests saving one fake article to Firestore
```

Then run the full pipeline:
```
python main.py
```

## Project structure

```
auto-news-site/
  scrape.py      Phase 1 - RSS ingestion
  rewrite.py     Phase 2 - AI rewrite (Gemini)
  store.py       Phase 3 - Firestore storage
  main.py        Orchestrates 1 -> 2 -> 3
  requirements.txt
  .env.example
  .gitignore
```

## Firestore security rules

The `articles` collection rules already cover public read / backend-only
write. Add the same pattern for the new `featured_articles` collection:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /articles/{articleId} {
      allow read: if true;
      allow write: if false;
    }
    match /featured_articles/{articleId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Long-form featured articles pipeline

`main_features.py` runs a separate, less-frequent pipeline that finds
genuinely multi-source trending topics and publishes long, cited
synthesis articles (not simple per-article summaries). Run manually
with `python main_features.py`, or schedule it separately (every few
hours, not hourly) via its own GitHub Actions workflow — see
`main.py` / `run-pipeline.yml` for the pattern to copy.


- Articles are deduplicated by link, so re-running the pipeline is safe.
- Rewrites are intentionally short (2-3 sentences) and always link back
  to the original source — keep it that way for copyright safety.
