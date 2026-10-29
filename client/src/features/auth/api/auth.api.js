const API_URL = import.meta.env.VITE_API_URL;

let refreshRequest;

const authRequest = (path, method = "GET") =>
  fetch(`${API_URL}/api/auth${path}`, {
    method,
    credentials: "include",
  });

export const startGoogleLogin = () => {
  window.location.assign(`${API_URL}/api/auth/google`);
};

export const getCurrentUser = async () => {
  let response = await authRequest("/me");

  if (response.status === 401) {
    if (!refreshRequest) {
      refreshRequest = authRequest("/refresh", "POST").finally(() => {
        refreshRequest = null;
      });
    }

    const refreshed = await refreshRequest;

    if (refreshed.status === 401) return null;

    if (!refreshed.ok) {
      throw new Error("Unable to refresh your session");
    }

    response = await authRequest("/me");
  }

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error("Unable to verify your session");
  }

  const data = await response.json();

  if (!data.success || !data.user?.id) {
    throw new Error("Invalid session response");
  }

  return data.user;
};

export const logoutUser = async () => {
  const response = await authRequest("/logout", "POST");

  if (!response.ok) {
    throw new Error("Logout failed. Please try again.");
  }
};

const postAuth = async (path, body) => {
  const response = await fetch(`${API_URL}/api/auth${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.errors?.[0]?.msg ||
      data?.errors?.[0]?.message ||
      data?.message ||
      "Unable to complete the request. Please try again."
    );
  }

  return data;
};

export const loginUser = ({ email, password }) =>
  postAuth("/login", { email, password });

export const registerUser = ({ name, email, password }) =>
  postAuth("/register", { name, email, password });