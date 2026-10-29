import { useEffect, useMemo, useRef, useState } from "react";
import useScanIndex from "./useScanIndex";
import { saveFindingStatus } from "../api/scan.api";

const statusMap = {
  open: "open",
  resolved: "reviewed",
  ignored: "dismissed",
};

const apiStatusMap = {
  open: "open",
  reviewed: "resolved",
  dismissed: "ignored",
};

const useFindings = (scanId) => {
  const {
    scan,
    setScan,
    error,
    isLoading,
    refresh,
  } = useScanIndex(scanId);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [message, setMessage] = useState(null);
  const [filters, setFilters] = useState({
    severity: "all",
    status: "all",
  });

  const requestRef = useRef(null);

  useEffect(() => {
    setSelectedId(null);
    setMessage(null);

    return () => {
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [scanId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const allFindings = useMemo(() => {
    if (
      scan?._id !== scanId ||
      scan?.analysisStatus !== "ready"
    ) {
      return [];
    }

    return scan.findings.map((finding) => ({
      ...finding,
      id: finding._id,
      file: finding.path,
      line: finding.startLine,
      code: finding.originalCode,
      analysis: finding.explanation,
      status: statusMap[finding.status] || "open",
    }));
  }, [scan, scanId]);

  const findings = useMemo(
    () =>
      allFindings.filter((finding) => {
        const text =
          `${finding.title} ${finding.file} ${finding.severity} ${finding.status}`
            .toLowerCase();

        return (
          text.includes(query) &&
          (filters.severity === "all" ||
            finding.severity === filters.severity) &&
          (filters.status === "all" ||
            finding.status === filters.status)
        );
      }),
    [allFindings, query, filters],
  );

  const selectedFinding =
    findings.find((finding) => finding.id === selectedId) ??
    findings[0];

  const updateStatus = async (id, status) => {
    if (
      isLoading ||
      requestRef.current ||
      !["open", "reviewed", "dismissed"].includes(status) ||
      !allFindings.some((finding) => finding.id === id)
    ) {
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    setMessage({ id, text: "Saving review…" });

    try {
      const serverStatus = apiStatusMap[status];

      const data = await saveFindingStatus(
        scanId,
        id,
        serverStatus,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      if (
        data.finding?._id !== id ||
        data.finding?.status !== serverStatus
      ) {
        throw new Error(
          "Could not confirm the saved status. Refresh and try again.",
        );
      }

      setScan((previous) => {
        if (previous?._id !== scanId) return previous;

        return {
          ...previous,
          findings: previous.findings.map((finding) =>
            finding._id === id
              ? { ...finding, status: data.finding.status }
              : finding,
          ),
        };
      });

      setMessage({ id, text: "Review saved to your account." });
    } catch (error) {
      if (controller.signal.aborted) return;

      setMessage({
        id,
        text:
          error instanceof TypeError
            ? "Could not confirm save. Check your connection and refresh."
            : error.message || "Could not save the review. Please retry.",
      });
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
      }
    }
  };

  return {
    scan,
    error,
    isLoading,
    refresh: () => {
      if (!requestRef.current) refresh();
    },
    search,
    setSearch,
    findings,
    allFindings,
    selectedFinding,
    selectFinding: setSelectedId,
    updateStatus,
    filters,
    setFilters,
    reviewMessage:
      message && selectedFinding && message.id === selectedFinding.id
        ? message.text
        : "",
  };
};

export default useFindings;