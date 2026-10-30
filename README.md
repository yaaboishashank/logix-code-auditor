# LogiX

LogiX scans a GitHub repository for missing error logs and unhandled errors, then lets you ask an AI about what it found.

I built it because many backend bugs are hard to trace: a `catch` block swallows the error and nothing gets logged. LogiX finds those spots and explains why logging is needed there.

## What it does

- Pulls a repository through the GitHub API and splits the files into chunks.
- Converts the chunks into vector embeddings and stores them in a vector database.
- Flags places where logs are missing or errors are not handled, with a suggested fix next to the original code.
- Answers debugging questions with Claude Haiku, using the relevant chunks from your own repo as context (RAG).
- Compares two versions of the same code, for example V1 and V2 controllers, and shows where one logs errors and the other ignores them.
- Signs users in with Google OAuth 2.0.

## Built with

Node.js, Claude Haiku, a vector database, the GitHub API, and Google OAuth 2.0.

## Running it locally

```bash
git clone https://github.com/yaaboishashank/Logix-Code-Intelligence-and-Log-Auditor.git
cd Logix-Code-Intelligence-and-Log-Auditor
npm install
```

Create a `.env` file with your own keys:

```
ANTHROPIC_API_KEY=
GITHUB_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
```

Then start the server:

```bash
npm start
```

## Example

LogiX flagged this `catch` block because the error is discarded and nothing is logged:

```js
} catch {
  sendJson(res, 503, { success: false, message: "Order could not be saved." });
}
```

The suggested fix logs an operation name and a request ID before sending the response:

```js
} catch {
  console.error({
    event: "order_operation_failed",
    operation: "saveOrder",
    requestId: req.requestId,
  });
  sendJson(res, 503, { success: false, message: "Order could not be saved." });
}
```

## Notes

AI suggestions can be wrong, so review each one before applying it.
