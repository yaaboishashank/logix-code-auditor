import { setTimeout as wait } from "node:timers/promises";

export const withAiRetry = async (request) => {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    console.log(`AI attempt ${attempt}/3`);

    try {
      return await request();
    } catch (error) {
      let details;

      try {
        details = JSON.parse(error.message).error;
      } catch {
        details = null;
      }

      const status = Number(error.status || details?.code);

      const retryInfo = details?.details?.find((item) =>
        item["@type"]?.endsWith("RetryInfo")
      );

      const seconds = Number.parseFloat(retryInfo?.retryDelay);

      const providerDelay =
        Number.isFinite(seconds) && seconds > 0
          ? seconds * 1000
          : 0;

      if (status === 429) {
        error.publicMessage = providerDelay
          ? `AI quota reached. Retry after at least ${Math.ceil(seconds)} seconds.`
          : "AI quota reached. Wait for your quota to reset before retrying.";

        throw error;
      }

      const transient = [500, 502, 503, 504].includes(status);

      if (!transient) throw error;

      error.publicMessage =
        status === 504
          ? "AI requests timed out. Please retry analysis later."
          : "AI service is temporarily unavailable. Please retry analysis later.";

      if (attempt === 3) throw error;

      const delay = Math.max(
        providerDelay,
        10000 * 2 ** (attempt - 1) + Math.floor(Math.random() * 1000)
      );

      if (delay > 60000) {
        error.publicMessage =
          `AI service asked us to wait. Retry after at least ` +
          `${Math.ceil(delay / 1000)} seconds.`;

        throw error;
      }

      console.warn(
        `AI returned ${status}. Retrying in ${Math.ceil(delay / 1000)}s.`
      );

      await wait(delay);
    }
  }
};