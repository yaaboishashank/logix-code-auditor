import { getCurrentUser } from "../../auth/api/auth.api";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const paymentRequest = async (path, body, signal) => {
  const options = {
    method: body ? "POST" : "GET",
    credentials: "include",
    signal,
    ...(body && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  };

  let response = await fetch(`${API_URL}/api/payments${path}`, options);

  if (response.status === 401) {
    const user = await getCurrentUser();
    signal?.throwIfAborted();

    if (user) {
      response = await fetch(`${API_URL}/api/payments${path}`, options);
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(
      response.status === 401
        ? "Please log in again."
        : data?.message || "Payment request failed. Check its status."
    );
  }

  return data;
};

export const getPaymentUser = getCurrentUser;

export const getCredits = (signal) =>
  paymentRequest("/credits", undefined, signal);

export const createPaymentOrder = () =>
  paymentRequest("/orders", {});

export const verifyPayment = (payment) =>
  paymentRequest("/verify", payment);

export const syncPayment = (orderId) =>
  paymentRequest(`/orders/${encodeURIComponent(orderId)}/sync`, {});