import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { loginUser, registerUser } from "../api/auth.api";

const usePasswordAuth = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [authError, setAuthError] = useState("");
  const [authPending, setAuthPending] = useState(false);

  const submit = async (values, mode) => {
    if (authPending) return;

    setAuthPending(true);
    setAuthError("");

    let accountCreated = false;

    try {
      if (mode === "register") {
        await registerUser(values);
        accountCreated = true;
      }

      await loginUser(values);

      navigate(mode === "register" ? "/" : "/workspace", {
        replace: true,
      });
    } catch (error) {
      setAuthError(
        accountCreated
          ? "Account created, but automatic sign-in failed. Please log in with your email and password."
          : error instanceof TypeError
            ? "Unable to connect to the server. Please try again."
            : error.message
      );
    } finally {
      setAuthPending(false);
    }
  };

  return {
    authError,
    authPending,
    submitLogin: (values) => submit(values, "login"),
    submitRegistration: (values) => submit(values, "register"),
    registrationMessage: state?.registered
      ? "Account created. Sign in to continue."
      : "",
  };
};

export default usePasswordAuth;