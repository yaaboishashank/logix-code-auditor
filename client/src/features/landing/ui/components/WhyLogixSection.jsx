import {
  ArrowUpRight,
  CircleAlert,
  GitPullRequest,
  Search,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useWorkspaceEntry } from "../../context/LandingContext";

const points = [
  {
    id: "missing-context",
    Icon: CircleAlert,
    title: "Notice what went quiet.",
    text: "Explore findings around silent error paths and missing logging context. See exactly where a useful signal could belong.",
    example: "catch (error) { return null; }",
  },
  {
    id: "evidence",
    Icon: Workflow,
    title: "Get the story around it.",
    text: "Read the code, the surrounding evidence, and the reasoning together. A finding is a starting point for your judgment.",
    example: "Code → Evidence → Suggested improvement",
  },
  {
    id: "review",
    Icon: ShieldCheck,
    title: "Useful signals. Less noise.",
    text: "Review what's missing alongside what's already covered. Keep the logs that help, without treating every function as a logging gap.",
    example: "More context. Not more logs.",
  },
];

const WhyLogixSection = () => {
  const openWorkspace = useWorkspaceEntry();

  return (
    <>
      <div className="landing-section">
        <div
          className="landing-container landing-principles"
          aria-label="Review principles"
        >
          <span><Search aria-hidden="true" /> Find the missing context</span>
          <span><Workflow aria-hidden="true" /> Follow the evidence</span>
          <span><GitPullRequest aria-hidden="true" /> Keep the final say</span>
        </div>
      </div>

      <section
        id="product"
        className="landing-section"
        aria-labelledby="product-title"
      >
        <div className="landing-container landing-product">
          <div className="landing-product-heading">
            <h2 id="product-title">
              The hardest bug<br />
              is the one with<br />
              <span>nothing to say.</span>
            </h2>

            <div className="landing-section-intro">
              <p>
                A swallowed exception. A failed request with no context.
                A log that says “error” and leaves you guessing.
              </p>
              <p>
                LOGIX brings those questions into a review you can
                actually work through.
              </p>
              <button className="landing-text-link" onClick={openWorkspace}>
                Take a closer look <ArrowUpRight aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="landing-review-points">
            {points.map(({ id, Icon, title, text, example }) => (
              <article id={id} key={id}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="landing-point-example">{example}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyLogixSection;