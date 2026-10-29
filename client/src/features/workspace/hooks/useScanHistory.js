import { useEffect, useState } from "react";
import { getScans } from "../api/scan.api";

const useScanHistory = () => {
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let timer;

    setIsLoading(true);
    setError(null);

    const loadScans = async () => {
      try {
        const data = await getScans(controller.signal);

        if (controller.signal.aborted) return;

        if (!Array.isArray(data.scans)) {
          throw new Error("Unexpected scan history response.");
        }

        setScans(data.scans);

        const hasRunningScan = data.scans.some(
          (scan) =>
            ["queued", "fetching"].includes(scan.status) ||
            (scan.status === "ready" &&
              ["queued", "indexing"].includes(scan.indexStatus)),
        );

        if (hasRunningScan) {
          timer = setTimeout(loadScans, 3000);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        setError({
          message:
            error instanceof TypeError
              ? "Cannot connect to the server. Please try again."
              : error.message,
          status: error.status,
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadScans();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [reload]);

  return {
    scans,
    isLoading,
    error,
    refresh: () => setReload((previous) => previous + 1),
  };
};

export default useScanHistory;
