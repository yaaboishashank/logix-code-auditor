import app from "./src/app.js";
import config from "./src/config/config.js";
import connectToDatabase from "./src/config/db.js";
import User from "./src/models/user.model.js";
import Session from "./src/models/session.model.js";
import { startIngestionWorker } from "./src/workers/ingestion.worker.js";
import { startAnalysisWorker } from "./src/ai/workers/analysis.worker.js";

await connectToDatabase();
await startIngestionWorker();
await startAnalysisWorker();
await User.init();
await Session.init();

const startServer = async () => {
  try {

    app.listen(config.PORT, () => {
      console.log(`LOGIX server: http://localhost:${config.PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
