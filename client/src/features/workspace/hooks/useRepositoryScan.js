import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
  createScan,
  ingestScan,
  getScan,
  getScanFiles,
} from "../api/scan.api";

const getError = (error) => ({
  message:
    error instanceof TypeError
      ? "Cannot connect to the server. Please try again."
      : error.message,
  status: error.status,
});

const useRepositoryScan = () => {
  const [params, setParams] = useSearchParams();
  const scanId = params.get("scan");

  const [scan, setScan] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [reload, setReload] = useState(0);

  const submitRequest = useRef(null);

  useEffect(() => {
    return () => submitRequest.current?.abort();
  }, []);

  useEffect(() => {
    setScan(null);
    setFiles([]);
    setIsWatching(false);

    if (!scanId) return;

    if (!/^[a-f\d]{24}$/i.test(scanId)) {
      setError({ message: "Invalid scan ID in the URL." });
      return;
    }

    const controller = new AbortController();
    let timer;

    setIsWatching(true);

    const checkStatus = async () => {
      try {
        const data = await getScan(scanId, controller.signal);

        if (controller.signal.aborted) return;

        setScan(data.scan);

        if (data.scan.status === "ready") {
          const result = await getScanFiles(scanId, controller.signal);

          if (controller.signal.aborted) return;

          setFiles(result.files);
          setIsWatching(false);
        } else if (["queued", "fetching"].includes(data.scan.status)) {
          timer = setTimeout(checkStatus, 2000);
        } else {
          setIsWatching(false);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(getError(error));
        setIsWatching(false);
      }
    };

    checkStatus();

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [scanId, reload]);

  const startScan = async (values) => {
    if (submitRequest.current) return;

    const controller = new AbortController();
    submitRequest.current = controller;

    setIsSubmitting(true);
    setError(null);
    setFiles([]);

    let id = values ? null : scanId;

    if (values) {
      setScan(null);
      setParams({}, { replace: true });
    }

    try {
      if (values) {
        const data = await createScan(values, controller.signal);
        id = data.scan._id;
      }

      const data = await ingestScan(id, controller.signal);

      if (!controller.signal.aborted) {
        setScan(data.scan);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(getError(error));
      }
    } finally {
      submitRequest.current = null;

      if (!controller.signal.aborted) {
        setIsSubmitting(false);

        if (id) {
          setParams({ scan: id }, { replace: true });
          setReload((previous) => previous + 1);
        }
      }
    }
  };

  const refreshStatus = () => {
    setError(null);
    setReload((previous) => previous + 1);
  };

  return {
    scanId,
    scan,
    files,
    error,
    isSubmitting,
    isWatching,
    isRunning:
      isSubmitting ||
      isWatching ||
      ["queued", "fetching"].includes(scan?.status),
    startScan,
    retryScan: () => startScan(null),
    refreshStatus,
  };
};

export default useRepositoryScan;