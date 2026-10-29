import ReviewActions from "./ReviewActions";
import CodeComparison from "./CodeComparison";
import FindingChat from "./FindingChat";

const FindingDetailPanel = ({
  finding,
  onStatusChange,
  reviewMessage,
}) => (
  <section
    className="finding-detail"
    aria-label="Finding details"
    tabIndex={0}
  >
    {!finding ? (
      <p className="findings-empty">
        No finding matches the current filters.
      </p>
    ) : (
      <>
        <header className="finding-detail-header">
          <span className={`finding-severity ${finding.severity}`}>
            {finding.severity}
          </span>

          <h2>{finding.title}</h2>

          <p className="finding-path">
            {finding.file}:{finding.startLine}–{finding.endLine}
          </p>
        </header>

        <CodeComparison
          originalCode={finding.originalCode}
          suggestedCode={finding.suggestedCode}
        />

        <section className="finding-detail-section">
          <h3>AI analysis</h3>
          <p>{finding.analysis}</p>
        </section>

        <p className="finding-review-note">
          AI suggestion · Review before applying.
        </p>

        <ReviewActions
          status={finding.status}
          onChange={(status) => onStatusChange(finding.id, status)}
          message={reviewMessage}
        />

        <FindingChat findingId={finding.id || finding._id} />
      </>
    )}
  </section>
);

export default FindingDetailPanel;