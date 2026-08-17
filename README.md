# Vaultiq

**Vaultiq** is an enterprise AI knowledge engine — upload internal documents and search, filter, and chat with them through a multi-agent AI backend that stays strictly grounded in your own content.

<p align="center">
  <img src="Example-Documents/search.png" width="49%" alt="Search home" />
  <img src="Example-Documents/results-1.png" width="49%" alt="Search results with filters" />
</p>
<p align="center">
  <img src="Example-Documents/chat.png" width="49%" alt="Document chat" />
  <img src="Example-Documents/summary-preview.png" width="49%" alt="Document summary panel" />
</p>

## What it does

- **Upload** PDF, DOCX, XLSX, PPTX, PNG, or JPG files (single or batch), tagging each with where it came from (direct upload, GitHub, Jira, Confluence, Google Drive, SharePoint, Notion, Slack).
- **Understand** every document automatically: a 3-bullet executive summary, specific search-relevant tags scaled to document length, and a single department classification (Engineering, Security, Finance, HR, Legal, IT, ...) used for filtering.
- **Search** across your whole corpus with real relevance ranking, or **chat** with a single document — answers come only from retrieved chunks of your own content, scoped to that document when chatting from its panel.
- **Manage your profile**: display name, job role, seniority, password, dark/light theme — all real, persisted settings.

See [`SETUP.md`](SETUP.md) for how to run this locally and deploy it.

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS v4, Firebase Auth |
| Backend | FastAPI, PostgreSQL + `pgvector` (Supabase), WebSockets for live upload progress |
| Document parsing | `pdfplumber`, `python-docx`, `openpyxl`, `python-pptx`, Groq vision-model OCR fallback |
| Embeddings | `sentence-transformers` (local, no external API) |
| Chat / RAG | LangGraph multi-agent router over Groq (`openai/gpt-oss-20b` / `120b`) |
| Observability | Langfuse |

Backend source lives in the sibling repo, `Vaultiq-Backend`.

## Repo layout

```
src/
  App.tsx            the app — search, results, filters, document drawer & chat,
                      agents/observability dashboards, profile & settings
  AuthPage.tsx        sign-in / sign-up
  lib/AuthContext.tsx Firebase auth state, display name, password change
  lib/firebase.ts     Firebase client config (safe to be public — see file comment)
  data/documents.ts   fallback mock documents, used only if the backend is unreachable
Example-Documents/    sample files across departments for testing uploads, plus README screenshots
```

## Known limitations

- Document `source` (GitHub, Jira, Google Drive, ...) is metadata you choose at upload time, not a live integration — nothing actually syncs with those services yet.
- Vision OCR quality depends on whichever vision-capable model is available on the configured Groq account; if none is available, it degrades to a placeholder note instead of failing the upload.
