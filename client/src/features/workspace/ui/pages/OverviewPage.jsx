import { ArrowLeft } from "lucide-react";

import useFindings from "../../hooks/useFindings";
import SignalSummary from "../components/SignalSummary";
import FindingsToolbar from "../components/findings/FindingsToolbar";
import FindingsPanel from "../components/findings/FindingsPanel";
import FindingDetailPanel from "../components/details/FindingDetailPanel";
import "../../findings-live.css";

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { getCurrentUser } from "../../../auth/api/auth.api";

const ScanOverview = ({ scanId }) => {
  const [showDetails, setShowDetails] = useState(false);
  const panelsRef = useRef(null);
  const backButtonRef = useRef(null);

  const {
    scan,
    error,
    isLoading,
    refresh,
    search,
    setSearch,
    findings,
    selectedFinding,
    selectFinding,
    allFindings,
    updateStatus,
    reviewMessage,
    filters,
    setFilters,
  } = useFindings(scanId);

  useEffect(() => {
    if (scan?._id !== scanId || scan.analysisStatus !== "ready") return;

    const userId =
      typeof scan.user === "string"
        ? scan.user
        : scan.user?._id || scan.user?.id;

    if (!userId) return;

    try {
      sessionStorage.setItem(`logix-last-scan:${userId}`, scanId);
    } catch {
      console.warn("Could not remember the selected scan.");
    }
  }, [scan, scanId]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({ ...previous, [name]: value }));
    setShowDetails(false);
  };

  const openFinding = (id) => {
    selectFinding(id);
    setShowDetails(true);

    if (window.matchMedia("(max-width: 760px)").matches) {
      requestAnimationFrame(() => {
        backButtonRef.current?.focus({ preventScroll: true });
      });
    }
  };

  const closeFinding = () => {
    setShowDetails(false);

    requestAnimationFrame(() => {
      panelsRef.current
        ?.querySelector('.findings-panel [aria-pressed="true"]')
        ?.focus({ preventScroll: true });
    });
  };

  const handleSearch = (value) => {
    setSearch(value);
    setShowDetails(false);
  };

  if (!scanId) {
    return (
      <section className="overview-state">
        <h2>Open a repository scan</h2>
        <p>Select a scan from history, or start a new scan.</p>

        <div className="overview-state-actions">
          <Link to="/workspace/history">Scan history</Link>
          <Link to="/workspace/new-scan">New scan</Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return <p role="status">Loading repository findings…</p>;
  }

  if (error) {
    return (
      <section className="overview-state">
        <p className="scan-error" role="alert">
          {error.message}
        </p>

        {error.status === 401 ? (
          <Link to="/login">Log in again</Link>
        ) : (
          <button type="button" className="ui-button" onClick={refresh}>
            Try again
          </button>
        )}
      </section>
    );
  }

  if (scan?.analysisStatus !== "ready") {
    return (
      <section className="overview-state">
        <h2>
          {scan?.analysisStatus === "failed"
            ? "Analysis failed"
            : "Analysis is not complete yet"}
        </h2>

        <p>
          {scan?.analysisError ||
            "Findings will appear after logging analysis finishes."}
        </p>

        <Link
          to={`/workspace/new-scan?scan=${encodeURIComponent(scanId)}`}
        >
          View scan progress
        </Link>
      </section>
    );
  }

  return (
    <div className="workspace-overview">
      <header className="scan-repository-summary">
        <div>
          <h2>{scan.repository}</h2>
          <p>
            {scan.branch} · Commit {scan.commitSha?.slice(0, 7)}
          </p>
        </div>

        <Link to="/workspace/history">Change repository</Link>
      </header>

      <SignalSummary
        findings={allFindings}
        fileCount={scan.fileCount ?? 0}
      />

      {!allFindings.length ? (
        <section className="overview-state">
          <h2>No logging issues detected in analysed files</h2>
          <p>
            The AI review returned no findings. This does not guarantee
            complete logging coverage.
          </p>
        </section>
      ) : (
        <div className="findings-workspace">
          <FindingsToolbar
            search={search}
            onSearch={handleSearch}
            count={findings.length}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <div
            ref={panelsRef}
            className={`findings-split ${showDetails ? "is-detail-open" : ""
              }`}
          >
            <FindingsPanel
              findings={findings}
              selectedId={selectedFinding?.id}
              onSelect={openFinding}
            />

            <div className="finding-detail-view">
              <button
                ref={backButtonRef}
                type="button"
                className="finding-back-button"
                onClick={closeFinding}
              >
                <ArrowLeft aria-hidden="true" />
                Back to findings
              </button>

              <FindingDetailPanel
                key={selectedFinding?.id ?? "empty"}
                finding={selectedFinding}
                onStatusChange={updateStatus}
                reviewMessage={reviewMessage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RestoreLastScan = () => {
  const navigate = useNavigate();

  const [isRestoring, setIsRestoring] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setIsRestoring(true);
    setError(null);

    const restore = async () => {
      try {
        const user = await getCurrentUser();

        if (cancelled) return;

        const userId = user?.id || user?._id;

        if (!userId) {
          setError({
            status: 401,
            message: "Please log in to open your workspace.",
          });
          setIsRestoring(false);
          return;
        }

        let savedScanId = "";

        try {
          savedScanId =
            sessionStorage.getItem(`logix-last-scan:${userId}`) || "";
        } catch {
          savedScanId = "";
        }

        if (/^[a-f0-9]{24}$/i.test(savedScanId)) {
          navigate(
            `/workspace?scan=${encodeURIComponent(savedScanId)}`,
            { replace: true }
          );

          // Keep loading visible until the destination mounts.
          return;
        }

        // Show the empty overview only when no saved scan exists.
        setIsRestoring(false);
      } catch {
        if (cancelled) return;

        setError({
          message: "Could not restore your workspace. Please try again.",
        });
        setIsRestoring(false);
      }
    };

    void restore();

    return () => {
      cancelled = true;
    };
  }, [navigate, attempt]);

  if (isRestoring) {
    return <p role="status">Opening your workspace…</p>;
  }

  if (error) {
    return (
      <section className="overview-state">
        <p className="scan-error" role="alert">
          {error.message}
        </p>

        {error.status === 401 ? (
          <Link to="/login">Log in</Link>
        ) : (
          <button
            type="button"
            className="ui-button"
            onClick={() => setAttempt((previous) => previous + 1)}
          >
            Try again
          </button>
        )}
      </section>
    );
  }

  return <ScanOverview scanId="" />;
};
const OverviewPage = () => {
  const [params] = useSearchParams();
  const scanId = params.get("scan") || "";

  return scanId ? (
    <ScanOverview key={scanId} scanId={scanId} />
  ) : (
    <RestoreLastScan />
  );
};

export default OverviewPage;