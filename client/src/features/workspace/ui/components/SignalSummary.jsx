const SignalSummary = ({ findings = [], fileCount = 0 }) => {
  const stats = [
    {
      label: "Files analyzed",
      value: fileCount,
    },
    {
      label: "Potential logging gaps",
      value: findings.length,
    },
    {
      label: "High priority",
      value: findings.filter((finding) => finding.severity === "high").length,
    },
  ];

  return (
    <dl className="workspace-stats" aria-label="Scan summary">
      {stats.map(({ label, value }) => (
        <div className="workspace-stat" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default SignalSummary;