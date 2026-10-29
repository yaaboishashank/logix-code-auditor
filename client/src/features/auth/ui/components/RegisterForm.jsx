import { useForm } from "react-hook-form";
import Button from "../../../../shared/ui/components/Button";
import AuthField from "./AuthField";
import GoogleAuthButton from "./GoogleAuthButton";
import usePasswordAuth from "../../hooks/usePasswordAuth";

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const {
    submitRegistration,
    authError,
    authPending,
  } = usePasswordAuth();

  return (
    <form
      className="auth-form"
      noValidate
      onSubmit={handleSubmit(submitRegistration)}
    >
      <AuthField
        label="Name"
        type="text"
        autoComplete="name"
        required
        error={errors.name}
        registration={register("name", {
          required: "Enter your name.",
          setValueAs: (value) => value.trim(),
          minLength: {
            value: 2,
            message: "Enter at least 2 characters.",
          },
          maxLength: {
            value: 60,
            message: "Use at most 60 characters.",
          },
        })}
      />

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
        autoComplete="new-password"
        required
        error={errors.password}
        registration={register("password", {
          required: "Create a password.",
          minLength: {
            value: 8,
            message: "Use at least 8 characters.",
          },
          validate: (value) =>
            new TextEncoder().encode(value).length <= 72 ||
            "Password is too long. Use a shorter password.",
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
        {authPending ? "Creating your account…" : "Create account"}
      </Button>
    </form>
  );
};

export default RegisterForm;