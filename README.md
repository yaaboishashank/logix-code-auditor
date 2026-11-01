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

## Scope

LOGIX reviews source code for potential logging gaps. Findings and suggested changes require developer review; it does not monitor runtime crashes or guarantee complete logging coverage.

---

Built by [Shashank Sharma](https://github.com/yaaboishashank)
