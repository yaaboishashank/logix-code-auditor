import { Link } from "react-router";

const titles = {
  validated: "Repository validated",
  queued: "Waiting to fetch files",
  fetching: "Fetching source files",
  ready: "Source files ready",
  failed: "Could not fetch source files",
};

const ScanProgress = ({
  scanId,
  scan,
  error,
  isSubmitting,
  isWatching,
  onRetry,
  onRefresh,
}) => {
  if (!scanId && !scan && !error && !isSubmitting) return null;

  const busy = isSubmitting || isWatching;
  const canRetry = ["validated", "failed"].includes(scan?.status);

  return (
    <section
      className="scan-progress"
      aria-labelledby="scan-status-title"
    >
      <h3 id="scan-status-title" role="status">
        {isSubmitting
          ? "Preparing scan…"
          : titles[scan?.status] ||
            (error ? "Scan request failed" : "Checking scan…")}
      </h3>

      {busy && <progress aria-label="Loading scan data" />}

      {scan && (
        <p>
          {scan.repository} · {scan.branch}
        </p>
      )}

      {scan?.status === "ready" && (
        <p>
          {scan.fileCount} files saved · {scan.skippedFileCount} excluded
        </p>
      )}

      {scan?.status === "failed" && (
        <p className="scan-error" role="alert">
          {scan.errorMessage}
        </p>
      )}

      {error && (
        <p className="scan-error" role="alert">
          {error.message}
        </p>
      )}

      <div className="scan-actions">
        {canRetry && (
          <button
            type="button"
            className="ui-button scan-secondary"
            disabled={busy}
            onClick={onRetry}
          >
            Retry ingestion
          </button>
        )}

        {error && scanId && (
          <button
            type="button"
            className="ui-button scan-secondary"
            disabled={busy}
            onClick={onRefresh}
          >
            Refresh status
          </button>
        )}

        {error?.status === 401 && (
          <Link to="/login">Log in</Link>
        )}
      </div>
    </section>
  );
};

export default ScanProgress;