const stages = {
  queued: {
    title: "Indexing queued…",
    description: "Waiting for the indexing worker to start.",
  },
  indexing: {
    title: "Preparing searchable code…",
    description: "Creating code embeddings and saving the search index.",
  },
  pending: {
    title: "Analysis queued…",
    description: "Code indexed. Waiting for the analysis worker.",
  },
  running: {
    title: "Analyzing repository…",
    description: "Checking missing logs and preparing suggestions.",
  },
};

const AnalysisLoader = ({ scan, error }) => {
  if (error || !scan || scan.status !== "ready") return null;

  const isIndexing = ["queued", "indexing"].includes(scan.indexStatus);

  const status = isIndexing
    ? scan.indexStatus
    : scan.indexStatus === "ready"
      ? scan.analysisStatus
      : null;

  const stage = stages[status];

  if (!stage) return null;

  return (
    <div className="analysis-loader" role="status" aria-atomic="true">
      <span className="analysis-loader-spinner" aria-hidden="true" />

      <div>
        <p className="analysis-loader-title">{stage.title}</p>
        <p className="analysis-loader-note">{stage.description}</p>
      </div>
    </div>
  );
};

export default AnalysisLoader;