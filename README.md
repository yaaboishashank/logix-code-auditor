# LOGIX
### Clarity before the crash.

AI-powered logging analysis for Node.js repositories. LOGIX identifies potential logging gaps, suggests code changes, and helps developers understand findings through a repository-aware chatbot.

## Features

- **Repository scanning** — Import source files from public GitHub repositories.
- **AI logging review** — Detect potential logging gaps with severity levels and source references.
- **Code comparison** — Review original code alongside suggested logging changes.
- **Repository-aware chat** — Discuss findings using RAG-powered code retrieval.
- **Review workflow** — Track scans, update finding statuses, and revisit conversations.
- **Authentication** — Email/password and Google OAuth with cookie-based sessions.
- **Chat credits** — Razorpay Test Mode integration for purchasing message packs.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, React Router, CSS, GSAP |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI & Retrieval | LangGraph, Claude, Google embeddings, Pinecone |
| Authentication | JWT, Passport.js, Google OAuth |
| Payments | Razorpay — Test Mode |
| Deployment | Docker, Render |

## Workflow

GitHub repository → Source ingestion → Code chunking → Embeddings & indexing → AI logging analysis → Findings dashboard → RAG chatbot

## Project Structure

- `client/` — React frontend organised by feature.
- `server/` — Express API with separate AI, RAG, and payment modules.
- `compose.yaml` — Docker Compose file that builds and runs the server and client.

## Configuration

The server reads its settings from `server/.env` (loaded with `dotenv`). Never commit this file.

| Variable | Required | Purpose |
|---|---|---|
| `JWT_SECRET` | Yes | Session signing secret, at least 64 characters. The server refuses to start without it. |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` | Yes | Google OAuth credentials. The server refuses to start without them. |
| `MONGO_URI` | For the database | MongoDB connection string (local or Atlas). |
| `GEMINI_API_KEY` | For indexing | Google embeddings. Optional `EMBEDDING_MODEL` (default `gemini-embedding-2`) and `EMBEDDING_DIMENSIONS` (default `768`). |
| `PINECONE_API_KEY`, `PINECONE_INDEX_NAME`, `PINECONE_INDEX_HOST` | For indexing | Pinecone vector index. |
| `ANTHROPIC_API_KEY` | For analysis | Claude. Optional `ANALYSIS_MODEL` overrides the default model name. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | For chat credits | Razorpay Test Mode keys. |
| `PORT`, `CLIENT_URL`, `NODE_ENV` | No | Default to `3000`, `http://localhost:5173` and `development`. |

## Running Locally

Requires Node.js 22 (the Dockerfile uses `node:22`).

**Server** (from `server/`):

```bash
npm install
npm run dev    # nodemon, restarts on changes
# or: npm start
```

**Client** (from `client/`):

```bash
npm install
npm run dev    # Vite dev server
```

**With Docker Compose** (from the repository root, after creating `server/.env`):

```bash
docker compose up --build
```

The compose file serves the API on `http://localhost:3000` and the client on `http://localhost:5173`.

Two helper scripts live in `server/scripts/`: `setup-pinecone.js` creates the Pinecone vector index (needs `PINECONE_API_KEY`), and `check-ai.js` checks the Pinecone and Gemini connections against your `.env`.

## Scope

LOGIX reviews source code for potential logging gaps. Findings and suggested changes require developer review; it does not monitor runtime crashes or guarantee complete logging coverage.

---

Built by [Shashank Sharma](https://github.com/yaaboishashank)
