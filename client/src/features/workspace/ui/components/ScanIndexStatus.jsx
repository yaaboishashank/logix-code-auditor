import { Link } from "react-router";
import useScanIndex from "../../hooks/useScanIndex";
import AnalysisLoader from "./AnalysisLoader";
import "../../scan-index.css";

const indexLabels = {
  pending: "Not started",
  queued: "Queued",
  indexing: "Indexing",
  ready: "Indexed",
  failed: "Failed",
};

const analysisLabels = {
  pending: "Waiting to start",
  running: "Analysing",
  ready: "Complete",
  failed: "Failed",
};

const ScanIndexStatus = ({ scanId }) => {
  const {
    scan,
    error,
    isLoading,
    isSubmitting,
    retry,
    startAnalysis,
    refresh,
  } = useScanIndex(scanId);

  const indexStatus = scan?.indexStatus || "pending";
  const analysisStatus = scan?.analysisStatus || "pending";
  const disabled = isLoading || isSubmitting;

  const showRequestLoader =
    !error && (isSubmitting || (!scan && isLoading));

  const canIndex =
    scan?.status === "ready" &&
    ["pending", "failed"].includes(indexStatus);

  return (
    <section className="scan-index-card" aria-label="Scan processing">
      <div className="scan-index-heading">
        <h3>Code indexing</h3>

        <span className="scan-index-badge" data-status={indexStatus}>
          {scan
            ? indexLabels[indexStatus] || indexStatus
            : isLoading
              ? "Checking…"
              : "Unavailable"}
        </span>
      </div>

      {showRequestLoader ? (
        <div
          className="analysis-loader"
          role="status"
          aria-atomic="true"
        >
          <span
            className="analysis-loader-spinner"
            aria-hidden="true"
          />

          <div>
            <p className="analysis-loader-title">
              {isSubmitting
                ? "Submitting request…"
                : "Checking scan progress…"}
            </p>

            <p className="analysis-loader-note">
              {isSubmitting
                ? "Waiting for the server to accept your request."
                : "Getting the latest processing status."}
            </p>
          </div>
        </div>
      ) : (
        <AnalysisLoader scan={scan} error={error} />
      )}

      {indexStatus === "ready" && (
        <p className="scan-index-message">
          {scan.chunkCount ?? 0} code chunks indexed.
        </p>
      )}

      {indexStatus === "failed" && scan?.indexError && (
        <p className="scan-error" role="alert">
          {scan.indexError}
        </p>
      )}

      {error && (
        <p className="scan-error" role="alert">
          {error.message}
        </p>
      )}

      {error?.status === 401 ? (
        <Link to="/login">Log in again</Link>
      ) : (
        <>
          <div className="scan-index-actions">
            {canIndex && (
              <button
                type="button"
                className="scan-index-retry"
                onClick={retry}
                disabled={disabled}
              >
                {isSubmitting
                  ? "Starting…"
                  : indexStatus === "failed"
                    ? "Retry indexing"
                    : "Start indexing"}
              </button>
            )}

            <button
              type="button"
              onClick={refresh}
              disabled={disabled}
            >
              {isLoading ? "Checking…" : "Refresh status"}
            </button>
          </div>

          {indexStatus === "ready" && (
            <section
              className="scan-analysis-status"
              aria-label="Logging analysis"
            >
              <div className="scan-index-heading">
                <h3>Logging analysis</h3>

                <span
                  className="scan-index-badge"
                  data-status={analysisStatus}
                >
                  {analysisLabels[analysisStatus] || analysisStatus}
                </span>
              </div>

              <p className="scan-index-message" role="status">
                {analysisStatus === "ready"
                  ? `${scan.findings.length} logging findings found.`
                  : analysisStatus === "running"
                    ? "Reviewing your source code."
                    : analysisStatus === "failed"
                      ? "Analysis failed. Your indexed code is still available."
                      : "Waiting for logging analysis to start."}
              </p>

              {analysisStatus === "failed" && scan.analysisError && (
                <p className="scan-error" role="alert">
                  {scan.analysisError}
                </p>
              )}

              <div className="scan-index-actions">
                {["pending", "failed"].includes(analysisStatus) && (
                  <button
                    type="button"
                    className="scan-index-retry"
                    onClick={startAnalysis}
                    disabled={disabled}
                  >
                    {isSubmitting
                      ? "Starting…"
                      : analysisStatus === "failed"
                        ? "Retry analysis"
                        : "Start analysis"}
                  </button>
                )}

                {analysisStatus === "ready" && (
                  <Link
                    className="ui-button"
                    to={`/workspace?scan=${encodeURIComponent(scanId)}`}
                  >
                    Go to dashboard
                  </Link>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
};

export default ScanIndexStatus;