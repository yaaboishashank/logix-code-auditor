const FindingCard = ({ finding, selected, onSelect }) => (
  <button
    type="button"
    className={`finding-card ${selected ? "is-selected" : ""}`}
    aria-pressed={selected}
    onClick={() => onSelect(finding.id)}
  >
    <span className="finding-card-meta">
      <span>{finding.id}</span>
      <span className={`finding-severity ${finding.severity}`}>
        {finding.severity}
      </span>
    </span>

    <strong>{finding.title}</strong>

    {finding.status !== "open" && (
      <span className={`finding-review-status ${finding.status}`}>
        {finding.status}
      </span>
    )}

    <span className="finding-path">
      {finding.file}:{finding.line}
    </span>
  </button>
);

export default FindingCard;