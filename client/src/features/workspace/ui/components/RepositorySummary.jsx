import { FolderGit2, GitBranch } from "lucide-react";

const RepositorySummary = () => (
  <section className="workspace-repository" aria-labelledby="repository-title">
    <div className="workspace-repository-name">
      <FolderGit2 aria-hidden="true" />

      <div>
        <p className="workspace-label">Sample repository</p>
        <h2 id="repository-title">logix-demo</h2>
      </div>
    </div>

    <div className="workspace-repository-meta">
      <span>
        <GitBranch aria-hidden="true" />
        main
      </span>
      <span>JavaScript</span>
    </div>
  </section>
);

export default RepositorySummary;