import { ArrowDown, ArrowRight } from "lucide-react";
import Button from "../../../../shared/ui/components/Button";
import { useWorkspaceEntry } from "../../context/LandingContext";
import SamplePreview from "./SamplePreview";

const HeroSection = () => {
  const openWorkspace = useWorkspaceEntry();

  return (
    <section className="landing-section" aria-labelledby="landing-title">
      <div className="landing-container landing-hero">
        <div className="landing-hero-copy">
          <h1 id="landing-title">
            Clarity,
            <br />
            before the <span>crash.</span>
          </h1>

          <p>
            Your code tells a story.
            <br />
            Make sure the important parts aren't silent.
          </p>

          <p className="landing-hero-description">
            Designed for <strong className="landing-node-highlight Nodejs"><i>Node.js  </i></strong>{" "}
             backends written in JavaScript or TypeScript.
            Discover potential logging gaps and review the supporting code evidence.
          </p>

          <div className="landing-hero-actions">
            <Button className="landing-primary" onClick={openWorkspace}>
              Explore the workspace <ArrowRight aria-hidden="true" />
            </Button>

            <a className="landing-text-link" href="#workflow">
              See how it works <ArrowDown aria-hidden="true" />
            </a>
          </div>

          <div className="landing-preview-note">
            <span />
            Interactive code preview
            <span className="landing-note-divider">/</span>
            Sample code, useful context
          </div>
        </div>

        <SamplePreview />
      </div>
    </section>
  );
};

export default HeroSection;