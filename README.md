# Vaultiq — Enterprise AI Knowledge Engine

Vaultiq is an intelligent enterprise search and knowledge platform. Upload internal documents, and a multi-agent AI backend parses, summarizes, tags, and embeds them so you can search and chat with your organization's knowledge — grounded strictly in your own documents.

|                                            |                                            |
| ------------------------------------------ | ------------------------------------------ |
| ![Search](Images/search.webp)               | ![Results](Images/results.webp)             |
| ![Chat](Images/chat.webp)                   | ![Summary](Images/summary.webp)             |

## How it works

**Frontend** — React 19 + Vite + Tailwind CSS v4, with Firebase Authentication (email/password and Google sign-in).

**Backend** — FastAPI + PostgreSQL (via Supabase, with the `pgvector` extension). Handles uploads, parsing, and chat over a WebSocket for live progress.

**Document pipeline** — every upload is parsed (`pdfplumber` / `python-docx` / `openpyxl` / `python-pptx`, with a Groq vision-model OCR fallback for scanned pages and images), then:
- summarized into a 3-bullet executive summary,
- tagged with specific, page-count-scaled keywords for search relevance,
- classified into a single department (Engineering, Security, Finance, HR, Legal, IT, ...) used for filtering,
- chunked and embedded locally (`sentence-transformers`, no external embedding API) into `pgvector` for retrieval.

**Chat / RAG** — a LangGraph multi-agent router (`openai/gpt-oss-20b` for classification, `openai/gpt-oss-120b` for generation, via Groq) classifies each query as RAG / Research / Comparison / Extraction / Location and answers strictly from retrieved document chunks — scoped to the document you're viewing when chatting from a document panel, or across your whole corpus from global search.

**Observability** — instrumented with Langfuse for LLM call traces, latency, and token cost.

---

## Project structure

- `src/App.tsx` — the app: search, results, filters, document drawer, document chat, agents/observability dashboards, profile & settings
- `src/AuthPage.tsx` — sign-in / sign-up screen
- `src/lib/AuthContext.tsx` — Firebase auth state, display name, password change
- `src/lib/firebase.ts` — Firebase client config (not a secret — see comment in file)
- `src/data/documents.ts` — fallback mock documents used only if the backend is unreachable

Backend lives in a sibling repo, `Vaultiq-Backend`.

---

## Local setup

### Frontend
```bash
npm install
npm run dev
```
Runs on `http://localhost:8443` by default (see `vite.config.ts` / `$PORT`).

### Backend
See the `Vaultiq-Backend` repo's own setup — briefly:
```bash
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python init_db.py       # requires DATABASE_URL with pgvector enabled
uvicorn main:app --reload
```

### Environment variables (frontend)
| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | In production | Base URL of the deployed backend (e.g. `https://vaultiq-backend.up.railway.app`). Defaults to `http://localhost:8000` for local dev. |

Firebase config is intentionally hardcoded in `src/lib/firebase.ts` — Firebase web `apiKey`/`appId` are public client identifiers, not secrets; access is enforced by Firebase's own auth rules, not by hiding this config.

---

## Deploying

### Frontend → Vercel
1. Import this repo into Vercel (framework preset: **Vite**).
2. Build command: `npm run build` · Output directory: `dist` (Vercel usually detects both automatically).
3. Add an environment variable: `VITE_API_URL` = your deployed backend URL (no trailing slash).
4. Deploy. Once you have the Vercel domain, add it to **Firebase Console → Authentication → Settings → Authorized domains** — sign-in will fail on the new domain otherwise.

### Backend → Railway
Deploy the `Vaultiq-Backend` repo separately; point this frontend's `VITE_API_URL` at whatever domain Railway assigns it. Backend env vars (`DATABASE_URL`, `GROQ_API_KEY*`, `LANGFUSE_*`) live in that repo's own `.env` / Railway service variables — never commit them.

---

## Known limitations

- Document `source` (GitHub, Jira, Google Drive, Confluence, ...) is user-selected at upload time as metadata, not a live integration — there's no actual sync with those services yet.
- Vision OCR depends on whichever vision-capable model is available on the configured Groq account; if none is available it degrades to a placeholder note rather than failing the upload.
