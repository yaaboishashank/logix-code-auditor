import { useLayoutEffect } from "react";
import { AudioLines, ArrowLeft } from "lucide-react";
import { Link, Outlet } from "react-router";
import "../../features/auth/auth.css";

const AuthLayout = () => {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="auth-shell">
      <header className="auth-header">
        <Link to="/" className="auth-brand" aria-label="LOGIX home">
          <AudioLines aria-hidden="true" />
          LOGIX
        </Link>

        <Link to="/" className="auth-back">
          <ArrowLeft aria-hidden="true" />
          Back to home
        </Link>
      </header>

      <main className="auth-main">
        <section className="auth-intro" aria-labelledby="auth-tagline">
          <span className="auth-eyebrow">CLARITY BEFORE THE CRASH</span>
          <h1 id="auth-tagline">Better logs.<br />Clearer answers.</h1>
          <p>Find logging gaps before they become debugging blind spots.</p>
        </section>

        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-card">
            <Outlet />
            <p className="auth-preview">
              Frontend preview · Login and signup aren’t connected yet.
            </p>
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        LOGIX · Clarity before the crash
      </footer>
    </div>
  );
};

export default AuthLayout;