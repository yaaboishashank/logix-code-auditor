import { getCurrentUser } from "../../auth/api/auth.api";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const scanRequest = async (
  path,
  { method = "GET", body, signal } = {},
) => {
  const options = {
    method,
    credentials: "include",
    signal,
  };

  if (body) {
    options.headers = {
      "Content-Type": "application/json",
    };

    options.body = JSON.stringify(body);
  }

  let response = await fetch(
    `${API_URL}/api/scans${path}`,
    options,
  );

  if (response.status === 401) {
    const user = await getCurrentUser();

    signal?.throwIfAborted();

    if (user) {
      response = await fetch(
        `${API_URL}/api/scans${path}`,
        options,
      );
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    const error = new Error(
      response.status === 401
        ? "Your session expired. Please log in again."
        : data?.message || "Unable to complete the scan request.",
    );

    error.status = response.status;

    throw error;
  }

  return data;
};

export const createScan = ({ repositoryUrl, branch }, signal) =>
  scanRequest("", {
    method: "POST",
    body: { repositoryUrl, branch },
    signal,
  });

export const getScans = (signal) =>
  scanRequest("", { signal });

export const getScan = (id, signal) =>
  scanRequest(`/${encodeURIComponent(id)}`, { signal });

export const ingestScan = (id, signal) =>
  scanRequest(`/${encodeURIComponent(id)}/ingest`, {
    method: "POST",
    signal,
  });

export const getScanFiles = (id, signal) =>
  scanRequest(`/${encodeURIComponent(id)}/files`, { signal });

export const getScanChunks = (id, signal) =>
  scanRequest(`/${encodeURIComponent(id)}/chunks`, { signal });

export const retryScanIndex = (id, signal) =>
  scanRequest(`/${encodeURIComponent(id)}/index`, {
    method: "POST",
    signal,
  });

export const queueScanAnalysis = (id, signal) =>
  scanRequest(`/${encodeURIComponent(id)}/analyze`, {
    method: "POST",
    signal,
  });

export const saveFindingStatus = (
  scanId,
  findingId,
  status,
  signal,
) =>
  scanRequest(
    `/${encodeURIComponent(scanId)}/findings/${encodeURIComponent(findingId)}`,
    {
      method: "PATCH",
      body: { status },
      signal,
    },
  );

export const sendScanMessage = (scanId, body, signal) =>
  scanRequest(`/${encodeURIComponent(scanId)}/chat`, {
    method: "POST",
    body,
    signal,
  });

export const getScanChat = (scanId, findingId, signal) => {
  const query = findingId
    ? `?findingId=${encodeURIComponent(findingId)}`
    : "";

  return scanRequest(
    `/${encodeURIComponent(scanId)}/chat${query}`,
    { signal },
  );
};

export const getLoggingRules = (signal) =>
  scanRequest("/preferences/logging", { signal });

export const saveLoggingRules = (loggingRules, signal) =>
  scanRequest("/preferences/logging", {
    method: "PATCH",
    body: { loggingRules },
    signal,
  });