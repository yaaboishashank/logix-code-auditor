import { ArrowRight, ArrowUpRight } from "lucide-react";
import Button from "../../../../shared/ui/components/Button";
import { useWorkspaceEntry } from "../../context/LandingContext";

const CTASection = () => {
  const openWorkspace = useWorkspaceEntry();

  return (
    <section className="landing-section" aria-labelledby="close-title">
      <div className="landing-container landing-close">
        <h2 id="close-title">
          Give your next “what happened?”{" "}
          <span>a better starting point.</span>
        </h2>

        <p>
          Meet LOGIX. See how a little context can change the next
          investigation.
        </p>

        <div className="landing-close-actions">
          <Button className="landing-primary" onClick={openWorkspace}>
            Enter workspace <ArrowUpRight aria-hidden="true" />
          </Button>

          <a className="landing-secondary" href="#sample">
            Explore the sample <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;