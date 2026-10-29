import { FolderGit2, ListChecks, ScanEye } from "lucide-react";

const steps = [
  {
    Icon: FolderGit2,
    title: "Connect your code.",
    text: "Choose a repository and branch to review its logging context.",
    detail: "Repository / branch",
  },
  {
    Icon: ScanEye,
    title: "Read the evidence.",
    text: "Move between findings, inspect the source, and compare a suggested improvement.",
    detail: "Finding + code + context",
  },
  {
    Icon: ListChecks,
    title: "Make the call.",
    text: "Review a finding and decide which suggested changes belong in your code.",
    detail: "Your review. Your judgment.",
  },
];

const HowItWorksSection = () => (
  <section
    id="workflow"
    className="landing-section"
    aria-labelledby="workflow-title"
  >
    <div className="landing-container landing-workflow">
      <div className="landing-workflow-heading">
        <h2 id="workflow-title">
          A clear path<br />through the quiet parts.
        </h2>
        <p>
          The workflow we're building.<br />
          One place to keep your review moving.
        </p>
      </div>

      <ol className="landing-steps">
        {steps.map(({ Icon, title, text, detail }, index) => (
          <li key={title}>
            <span className="landing-step-number">0{index + 1}</span>
            <Icon aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
            <span className="landing-step-detail">{detail}</span>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default HowItWorksSection;