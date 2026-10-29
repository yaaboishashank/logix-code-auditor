import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthField = ({ label, registration, error, type = "text", ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const { name } = registration;

  return (
    <div className="auth-field">
      <label htmlFor={name}>{label}</label>

      <div className="auth-input-wrap">
        <input
          {...props}
          {...registration}
          id={name}
          type={isPassword && showPassword ? "text" : type}
          className={isPassword ? "auth-password" : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
        />

        {isPassword && (
          <button
            type="button"
            className="auth-password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((previous) => !previous)}
          >
            {showPassword
              ? <EyeOff aria-hidden="true" />
              : <Eye aria-hidden="true" />}
          </button>
        )}
      </div>

      {error && (
        <p id={`${name}-error`} className="auth-error" role="alert">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default AuthField;