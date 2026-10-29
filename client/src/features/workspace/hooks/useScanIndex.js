import { useEffect, useRef, useState } from "react";
import {
  getScan,
  retryScanIndex,
  queueScanAnalysis,
} from "../api/scan.api";

const useScanIndex = (scanId) => {
  const [scan, setScan] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reload, setReload] = useState(0);

  const controllerRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    let timer;

    setIsLoading(Boolean(scanId));
    setError(null);

    const loadScan = async () => {
      try {
        const data = await getScan(scanId, controller.signal);

        if (controller.signal.aborted) return;

        if (data.scan?._id !== scanId) {
          throw new Error("Unexpected scan response.");
        }

        if (
          data.scan.analysisStatus === "ready" &&
          !Array.isArray(data.scan.findings)
        ) {
          throw new Error("The scan response is missing its findings.");
        }

        setScan(data.scan);

        const sourceRunning = ["queued", "fetching"].includes(
          data.scan.status
        );

        const indexRunning =
          data.scan.status === "ready" &&
          ["queued", "indexing"].includes(data.scan.indexStatus);

        const analysisRunning =
          data.scan.indexStatus === "ready" &&
          ["pending", "running"].includes(data.scan.analysisStatus);

        if (sourceRunning || indexRunning || analysisRunning) {
          timer = setTimeout(loadScan, 3000);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        setError({
          message: error.message,
          status: error.status,
        });
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    if (scanId) loadScan();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [scanId, reload]);

  const submit = async (request) => {
    const controller = controllerRef.current;

    if (
      !scanId ||
      !controller ||
      controller.signal.aborted ||
      isLoading ||
      busyRef.current
    ) {
      return;
    }

    busyRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const data = await request(scanId, controller.signal);

      if (controller.signal.aborted) return;

      setScan(data.scan);
      setReload((previous) => previous + 1);
    } catch (error) {
      if (controller.signal.aborted) return;

      setError({
        message: error.message,
        status: error.status,
      });
    } finally {
      busyRef.current = false;

      if (!controller.signal.aborted) {
        setIsSubmitting(false);
      }
    }
  };

  return {
    scan,
    setScan,
    error,
    isLoading,
    isSubmitting,
    retry: () => submit(retryScanIndex),
    startAnalysis: () => submit(queueScanAnalysis),
    refresh: () => setReload((previous) => previous + 1),
  };
};

export default useScanIndex;