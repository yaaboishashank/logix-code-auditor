# LOGIX Server

Express 5 API server for LOGIX. It handles authentication, code scans,
ingestion and RAG indexing, AI analysis and chat, and credit-based payments.

This document describes the current source. See the root README for the full
environment-variable table and Docker setup.

## Stack

- Express 5 with Mongoose (MongoDB), cookie-based sessions and JWT
- Passport with Google OAuth 2.0, plus local email/password auth (bcryptjs)
- LangChain / LangGraph with Anthropic and Google Generative AI SDKs
- Pinecone for vector search over scanned code
- Razorpay for credit purchases
- express-validator for request validation, express-rate-limit for throttling

## Layout

```
server.js            Entry point: connects MongoDB, starts the ingestion and
                     analysis workers, initializes model indexes, then listens
src/
  app.js             Express app: middleware, routes, /api/health, error handler
  config/            Env config, MongoDB connection, logging rules, Passport setup
  controllers/       Auth, scan, ingestion and preferences controllers
  middlewares/       Auth guard (protect), origin check, rate limiters,
                     central error handler
  models/            User, session, scan, finding and source-file schemas
  routes/            /api/auth and /api/scans routers
  services/          GitHub and ingestion services
  validators/        express-validator chains for each route group
  workers/           Ingestion worker
  ai/                Analysis and chat controllers, LangGraph graphs, prompts,
                     services (including AI retry), chat-turn model, validators,
                     analysis worker
  rag/               Code-search controller, services and validators
  payments/          Razorpay orders, credits, verification and webhook
scripts/             check-ai.js and setup-pinecone.js helpers
```

## API surface

All routers set `Cache-Control: no-store`. Protected routes require an
authenticated session (`protect`) and a same-origin check (`checkOrigin`).

### /api/auth

| Method | Path               | Purpose                              |
| ------ | ------------------ | ------------------------------------ |
| GET    | /google            | Start Google OAuth (rate limited)    |
| GET    | /google/callback   | OAuth callback, verifies state       |
| POST   | /register          | Create an account (validated)        |
| POST   | /login             | Email/password login (validated)     |
| POST   | /refresh           | Rotate the session token             |
| POST   | /logout            | End the session                      |
| GET    | /me                | Current user (requires auth)         |

### /api/scans (auth required)

| Method | Path                          | Purpose                                   |
| ------ | ----------------------------- | ----------------------------------------- |
| GET    | /                             | List the user's scans                     |
| POST   | /                             | Create a scan (8 per 15 min per user)     |
| GET    | /:scanId                      | Get one scan                              |
| POST   | /:scanId/ingest               | Ingest the scan's source files            |
| POST   | /:scanId/index                | Queue RAG indexing for the scan           |
| GET    | /:scanId/files                | List ingested files                       |
| GET    | /:scanId/chunks               | List indexed chunks                       |
| POST   | /:scanId/search               | RAG search over the scan's code           |
| POST   | /:scanId/analyze              | Queue AI analysis of the scan             |
| POST   | /:scanId/chat                 | Chat with the scan (30 per 15 min)        |
| GET    | /:scanId/chat                 | Chat history for the scan                 |
| PATCH  | /:scanId/findings/:findingId  | Update a finding's status                 |
| GET    | /preferences/logging          | Read AI logging preferences               |
| PATCH  | /preferences/logging          | Update AI logging preferences             |

### /api/payments (auth required)

| Method | Path     | Purpose                     |
| ------ | -------- | --------------------------- |
| GET    | /credits | Remaining chat credits      |
| POST   | /orders  | Create a Razorpay order     |
| POST   | /verify  | Verify a payment signature  |
| POST   | /sync    | Sync payment state          |

`POST /api/payments/webhook` is mounted before JSON parsing with the raw
request body, so Razorpay signature verification sees the exact payload.

### /api/health

Returns `200` with `{"success":true,"app":"LOGIX","database":"connected"}`
when MongoDB is connected, otherwise `503` with `"database":"disconnected"`.

## Run

1. Place this `server` folder beside `client` inside your LOGIX project.
2. Open a terminal inside `server`.
3. Run `npm install`.
4. Configure `.env` using the Configuration table in the root README
   (MongoDB, Google OAuth, AI provider keys, Pinecone and Razorpay).
   Start local MongoDB on port 27017, or use an Atlas connection string
   as `MONGO_URI`.
5. Run `npm run dev` and keep the terminal open.
6. Open http://localhost:3000/api/health.

If you see `ECONNREFUSED 127.0.0.1:27017`, the local MongoDB connection was refused.
On Windows, open `services.msc`, locate the MongoDB service, and start it if
installed. Then restart `npm run dev`. MongoDB Compass alone does not start a
local database server. The Express server starts only after MongoDB connects.

`npm start` runs the server without automatic restarts.
Keep `.env` out of Git.
