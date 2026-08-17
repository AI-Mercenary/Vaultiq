# Setup & Deployment

This project is split across two repos:

- **`Vaultiq`** (this repo) — the frontend
- **`Vaultiq-Backend`** — the API, document pipeline, and AI agents

Both must be running for the app to be functional; the frontend falls back to a static mock document list if it can't reach the backend.

---

## 1. Prerequisites

- Node.js 22+ and npm
- Python 3.11+ (backend)
- A PostgreSQL database with the `pgvector` extension enabled — [Supabase](https://supabase.com) is the easiest way to get this for free
- A [Groq](https://console.groq.com) API key
- A [Firebase](https://console.firebase.google.com) project with Email/Password and Google sign-in enabled under Authentication → Sign-in method
- (Optional) A [Langfuse](https://langfuse.com) project, for LLM call tracing

---

## 2. Backend setup (`Vaultiq-Backend`)

```bash
cd Vaultiq-Backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `Vaultiq-Backend/`:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require

GROQ_API_KEY=gsk_...
GROQ_API_KEY_AGENTS=gsk_...       # optional — falls back to GROQ_API_KEY
GROQ_API_KEY_CHATBOT=gsk_...      # optional — falls back to GROQ_API_KEY
GROQ_API_KEY_VISION=gsk_...       # optional — falls back to GROQ_API_KEY

LANGFUSE_PUBLIC_KEY=pk-lf-...     # optional
LANGFUSE_SECRET_KEY=sk-lf-...     # optional
LANGFUSE_HOST=https://us.cloud.langfuse.com
```

Enable `pgvector` on your database once, then create the tables:

```bash
psql "$DATABASE_URL" -c "CREATE EXTENSION IF NOT EXISTS vector;"
python init_db.py
```

Run it:

```bash
uvicorn main:app --reload
```

The API listens on `http://127.0.0.1:8000` by default. Confirm it's up:

```bash
curl http://127.0.0.1:8000/api/health
```

### Notes on the Groq model IDs

The models this project uses (`openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `meta-llama/llama-4-scout-17b-16e-instruct` for vision) are what was available on the configured account at time of writing. Groq periodically decommissions models — if you see `model_decommissioned` errors, check `https://console.groq.com/docs/deprecations` and update the model IDs in `agents/langgraph_router.py`, `agents/chatbot.py`, and `services/vision_parser.py`.

---

## 3. Frontend setup (this repo)

```bash
npm install
npm run dev
```

Runs on `http://localhost:8443` (configurable via `$PORT`; see `vite.config.ts`).

### Environment variables

Create a `.env` file (or `.env.local`) in this repo's root:

```env
VITE_API_URL=http://localhost:8000
```

This is the only environment variable the frontend needs. Firebase's config is intentionally hardcoded in `src/lib/firebase.ts` — Firebase web `apiKey`/`appId` values are public client identifiers, not secrets; access control is enforced by Firebase's own auth rules, not by hiding this config. If you're standing up your own Firebase project, update that file with your project's config instead of adding an env var for it.

---

## 4. Deploying

### Backend → Railway

1. Create a new Railway project from this GitHub repo (`Vaultiq-Backend`).
2. Add the same environment variables listed above as Railway service variables.
3. Set the start command if Railway doesn't detect it automatically:
   ```
   uvicorn main:app --host 0.0.0.0 --port $PORT
   ```
4. Once deployed, note the public URL Railway assigns (e.g. `https://vaultiq-backend-production.up.railway.app`) — you'll need it for the frontend.
5. `main.py`'s CORS middleware currently allows all origins (`allow_origins=["*"]`). That's fine to get started, but once your Vercel domain is stable, consider locking it to that specific origin.

### Frontend → Vercel

1. Import this repo in Vercel. Framework preset: **Vite** (build command `npm run build`, output directory `dist` — Vercel usually detects both).
2. Add one environment variable:
   - `VITE_API_URL` = your Railway backend URL from above, **no trailing slash**.
3. Deploy.
4. **Add the Vercel domain to Firebase**: Firebase Console → your project → Authentication → Settings → Authorized domains → Add domain → paste your Vercel URL (e.g. `vaultiq.vercel.app`). Sign-in silently fails on any domain not in this list.
5. If you update `VITE_API_URL` later (e.g. after the backend moves), redeploy from Vercel → Deployments for the change to take effect — Vite env vars are baked in at build time, not read at runtime.

---

## 5. Verifying everything works end-to-end

1. Open the deployed frontend, sign up or sign in.
2. Upload a file from `Example-Documents/` (pick any department folder) — you should see live progress (`parsing → chunking → embedding → completed`) over the WebSocket.
3. Search for a term from that document — it should appear with a summary, tags, and a department badge.
4. Open the document and ask it a question in the Chat tab — the answer should cite content from that specific document, not the whole corpus.
5. Toggle Dark/Light mode in Profile & Settings — it should apply instantly and survive a reload.

If step 2 or 4 fail, check the backend logs first — most issues trace back to a missing/invalid `GROQ_API_KEY`, `DATABASE_URL` missing the `pgvector` extension, or a decommissioned Groq model ID (see the note above).
