import { Link } from "react-router";
import "../../scan-index.css";

const statusLabels = {
  validated: "Validated",
  queued: "Queued",
  fetching: "Fetching",
  ready: "Files ready",
  failed: "Failed",
};

const indexLabels = {
  pending: "Not started",
  queued: "Queued",
  indexing: "Indexing",
  ready: "Indexed",
  failed: "Failed",
};

const ScanHistoryList = ({ scans }) => {
  if (!scans.length) {
    return (
      <div className="history-empty">
        <p>No scans yet.</p>
        <Link to="/workspace/new-scan">New scan</Link>
      </div>
    );
  }

  return (
    <div
      className="history-table"
      role="region"
      aria-label="Scan history"
      tabIndex={0}
    >
      <table aria-label="Scan history">
        <thead>
          <tr>
            <th scope="col">Repository</th>
            <th scope="col">Branch</th>
            <th scope="col">Date</th>
            <th scope="col">Source files</th>
            <th scope="col">Indexing</th>
            <th scope="col">Files</th>
            <th scope="col">Chunks</th>
            <th scope="col">Details</th>
          </tr>
        </thead>

        <tbody>
          {scans.map((scan) => (
            <tr key={scan._id}>
              <td>{scan.repository}</td>
              <td>{scan.branch}</td>

              <td>
                <time dateTime={scan.createdAt}>
                  {new Date(scan.createdAt).toLocaleDateString("en-IN")}
                </time>
              </td>

              <td>
                <span className={`history-status ${scan.status}`}>
                  {statusLabels[scan.status] || scan.status}
                </span>
              </td>

              <td>
                {scan.status === "ready" ? (
                  <span
                    className="scan-index-badge"
                    data-status={scan.indexStatus || "pending"}
                  >
                    {indexLabels[scan.indexStatus || "pending"] ||
                      scan.indexStatus}
                  </span>
                ) : "—"}
              </td>

              <td>
                {scan.status === "ready" ? scan.fileCount ?? 0 : "—"}
              </td>

              <td>
                {scan.status === "ready" && scan.indexStatus === "ready"
                  ? scan.chunkCount
                  : "—"}
              </td>

              <td>
                <Link
                  to={`/workspace/new-scan?scan=${encodeURIComponent(scan._id)}`}
                  aria-label={`View scan for ${scan.repository}`}
                >
                  View scan
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScanHistoryList;