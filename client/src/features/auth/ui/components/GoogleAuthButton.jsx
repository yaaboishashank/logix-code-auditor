import { startGoogleLogin } from "../../api/auth.api";

const GoogleAuthButton = () => (
  <div className="auth-google">
    <button
      type="button"
      className="auth-google-button"
      onClick={startGoogleLogin}
    >
      <img
        src="https://developers.google.com/static/identity/images/g-logo.png"
        alt=""
        width="20"
        height="20"
      />
      Continue with Google
    </button>

    <div className="auth-google-divider">
      <span>or continue with email</span>
    </div>
  </div>
);

export default GoogleAuthButton;