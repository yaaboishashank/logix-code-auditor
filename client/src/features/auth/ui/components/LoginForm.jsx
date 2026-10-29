import { useForm } from "react-hook-form";
import Button from "../../../../shared/ui/components/Button";
import AuthField from "./AuthField";
import GoogleAuthButton from "./GoogleAuthButton";
import usePasswordAuth from "../../hooks/usePasswordAuth";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" });

  const {
    submitLogin,
    authError,
    authPending,
    registrationMessage,
  } = usePasswordAuth();

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={handleSubmit(submitLogin)}
    >
      {registrationMessage && (
        <p className="auth-status" role="status">
          {registrationMessage}
        </p>
      )}

      <AuthField
        label="Email"
        type="email"
        autoComplete="username"
        required
        error={errors.email}
        registration={register("email", {
          required: "Enter your email.",
          setValueAs: (value) => value.trim(),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Enter a valid email.",
          },
        })}
      />

      <AuthField
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
        registration={register("password", {
          required: "Enter your password.",
        })}
      />

      {authError && (
        <p className="auth-error" role="alert">
          {authError}
        </p>
      )}

      <GoogleAuthButton />

      <Button
        type="submit"
        disabled={authPending}
        aria-busy={authPending}
      >
        {authPending ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
};

export default LoginForm;