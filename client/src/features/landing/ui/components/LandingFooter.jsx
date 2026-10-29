import { ArrowUpRight } from "lucide-react";
import Logo from "../../../../shared/ui/components/Logo";
import { useWorkspaceEntry } from "../../context/LandingContext";

const LandingFooter = () => {
  const openWorkspace = useWorkspaceEntry();

  return (
    <footer className="landing-footer">
      <div className="landing-container">
        <div className="landing-footer-top">
          <Logo />
          <a className="landing-back-top" href="#top">
            Back to top <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className="landing-footer-columns">
          <nav aria-labelledby="footer-product">
            <h3 id="footer-product">Product</h3>
            <a href="#product">Why LOGIX</a>
            <a href="#workflow">How it works</a>
            <button onClick={openWorkspace}>Open workspace</button>
          </nav>

          <nav aria-labelledby="footer-explore">
            <h3 id="footer-explore">Explore</h3>
            <a href="#missing-context">Missing context</a>
            <a href="#evidence">Code &amp; evidence</a>
            <a href="#review">Review decisions</a>
          </nav>

          <nav aria-labelledby="footer-preview">
            <h3 id="footer-preview">The preview</h3>
            <a href="#sample">Sample code</a>
            <a href="#questions">Common questions</a>
          </nav>

          <div className="landing-footer-about">
            <h3>Made for the next investigation.</h3>
            <p>Clarity, before the crash.</p>
            <span>
              Interactive code preview<br />
              Built around useful context
            </span>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>LOGIX</span>
          <p>Find the missing context. Keep the final say.</p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;