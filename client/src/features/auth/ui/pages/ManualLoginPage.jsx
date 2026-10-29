import { Link } from "react-router";
import { ArrowRight, KeyRound } from "lucide-react";
import "./ManualLoginPage.css";

const ManualLoginPage = () => (
  <main className="auth-method-page">
    <section
      className="auth-method-card"
      aria-labelledby="auth-method-title"
    >
      <KeyRound className="auth-method-icon" aria-hidden="true" />

      <h1 id="auth-method-title">
        Sign in with your
        <br />
        email and password.
      </h1>

      <p>
        This account was created using email and password.
        Google sign-in isn’t connected to it.
      </p>

      <p>Use the LOGIX password you chose when creating your account.</p>

      <div className="auth-method-actions">
        <Link to="/login" className="ui-button">
          Log in with email
          <ArrowRight aria-hidden="true" />
        </Link>

        <Link to="/" className="auth-method-back">
          Back to website
        </Link>
      </div>
    </section>
  </main>
);

export default ManualLoginPage;