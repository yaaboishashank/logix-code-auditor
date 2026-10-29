# LOGIX Server — Phase 1, Part 1

Current work: Express server, environment configuration, MongoDB connection,
CORS for the local React client, and GET /api/health.

The controllers, routes, models, and authentication/error middleware files are
empty placeholders. Authentication and scanning have not been implemented.

## Run

1. Place this `server` folder beside `client` inside your LOGIX project.
2. Open a terminal inside `server`.
3. Run `npm install`.
4. Start local MongoDB on port 27017, or put your Atlas connection string in
   `.env` as `MONGO_URI`. The included `.env` contains local example values only.
5. Run `npm run dev` and keep the terminal open.
6. Open http://localhost:3000/api/health.

On success:

```json
{"success":true,"app":"LOGIX","database":"connected"}
```

If you see `ECONNREFUSED 127.0.0.1:27017`, the local MongoDB connection was refused.
On Windows, open `services.msc`, locate the MongoDB service, and start it if
installed. Then restart `npm run dev`. MongoDB Compass alone does not start a
local database server. The Express server starts only after MongoDB connects.

`npm start` runs the server without automatic restarts.
The archive excludes node_modules. Keep `.env` out of Git.
