# Auto News Site (educational project)

Scrapes RSS feeds, rewrites articles with Gemini, stores them in Firestore.
Built as a learning project — not a production news product.

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

## Notes

- Articles are deduplicated by link, so re-running the pipeline is safe.
- Rewrites are intentionally short (2-3 sentences) and always link back
  to the original source — keep it that way for copyright safety.
- Next steps (not yet built): GitHub Actions scheduling (Phase 4),
  frontend website (Phase 5), deployment (Phase 6).
