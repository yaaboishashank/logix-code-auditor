import { useLayoutEffect } from "react";
import { Link } from "react-router";
import { ArrowDown, ArrowRight } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuth } from "../../../auth/context/AuthContext";
import HeroSection from "./HeroSection";
import "./LandingHero.css";

const LandingHero = () => {
  const { user, isLoading } = useAuth();

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => cancelAnimationFrame(frame);
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <section className="logix-welcome" aria-busy="true">
        <p role="status">Getting things ready…</p>
      </section>
    );
  }

  if (!user) return <HeroSection />;

  const firstName = user.name?.trim().split(/\s+/)[0] || "developer";

  return (
    <section
      className="landing-section logix-welcome"
      aria-labelledby="welcome-title"
    >
      <div className="logix-welcome-content">
        <h1 id="welcome-title">
          Welcome back,
          <br />
          <span>{firstName}.</span>
        </h1>

        <p className="logix-welcome-subtitle">
          Your code. A clearer next step.
        </p>

        <p className="logix-welcome-description">
          Head to your workspace to review logging gaps in your{" "}
          <strong>Node.js</strong> backend and explore the code behind
          each finding.
        </p>

        <div className="logix-welcome-actions">
          <Link to="/workspace" className="ui-button">
            Open workspace
            <ArrowRight aria-hidden="true" />
          </Link>

          <a href="#workflow" className="logix-welcome-link">
            See how it works
            <ArrowDown aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;