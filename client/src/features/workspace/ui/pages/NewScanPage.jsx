import ScanForm from "../components/ScanForm";
import ScanProgress from "../components/ScanProgress";
import ScanFiles from "../components/ScanFiles";
import ScanIndexStatus from "../components/ScanIndexStatus";
import useRepositoryScan from "../../hooks/useRepositoryScan";

const NewScanPage = () => {
  const {
    scanId,
    scan,
    files,
    error,
    isSubmitting,
    isWatching,
    isRunning,
    startScan,
    retryScan,
    refreshStatus,
  } = useRepositoryScan();

  const currentScanId = scan?._id || scanId;
  const hasScan = Boolean(currentScanId);

  return (
    <div className="new-scan-page">
      <h2>{hasScan ? "Repository scan" : "Scan a repository"}</h2>

      <p className="scan-note">
        {scan
          ? `${scan.repository} · ${scan.branch}`
          : hasScan
            ? "View source files and indexing status."
            : "Fetch and index source files from a public GitHub repository."}
      </p>

      {!hasScan && (
        <ScanForm
          onStart={startScan}
          isRunning={isRunning}
        />
      )}

      <ScanProgress
        scanId={currentScanId}
        scan={scan}
        error={error}
        isSubmitting={isSubmitting}
        isWatching={isWatching}
        onRetry={retryScan}
        onRefresh={refreshStatus}
      />

      {currentScanId && scan?.status === "ready" && (
        <ScanIndexStatus
          key={currentScanId}
          scanId={currentScanId}
        />
      )}

      <ScanFiles files={files} />
    </div>
  );
};

export default NewScanPage;