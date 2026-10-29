import { Link } from "react-router";
import useScanHistory from "../../hooks/useScanHistory";
import ScanHistoryList from "../components/ScanHistoryList";

const ScanHistoryPage = () => {
  const { scans, isLoading, error, refresh } = useScanHistory();

  return (
    <div className="scan-history-page">
      <div className="history-toolbar">
        <h2>Scan history</h2>

        <button
          type="button"
          className="ui-button"
          disabled={isLoading}
          onClick={refresh}
        >
          {isLoading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <p className="history-note">Latest 20 scans.</p>

      {isLoading && <p role="status">Loading scan history…</p>}

      {error && (
        <div className="history-empty">
          <p role="alert">{error.message}</p>

          {error.status === 401 && (
            <Link to="/login">Log in</Link>
          )}
        </div>
      )}

      {!isLoading && !error && (
        <ScanHistoryList scans={scans} />
      )}
    </div>
  );
};

export default ScanHistoryPage;