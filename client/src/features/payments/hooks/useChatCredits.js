import { useEffect, useRef, useState } from "react";
import {
  getPaymentUser,
  getCredits,
  createPaymentOrder,
  verifyPayment,
  syncPayment,
} from "../api/payment.api";

const useChatCredits = () => {
  const [wallet, setWallet] = useState(null);
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const storageKeyRef = useRef("");
  const busyRef = useRef(false);
  const activeRef = useRef(false);
  const checkoutRef = useRef(null);
  const balanceVersionRef = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    activeRef.current = true;

    const load = async () => {
      try {
        const user = await getPaymentUser();

        if (controller.signal.aborted) return;

        const userId = user?.id || user?._id;

        if (!userId) {
          throw new Error("Please log in again.");
        }

        const key = `logix-pending-payment:test:${userId}`;
        storageKeyRef.current = key;

        const saved = sessionStorage.getItem(key);

        if (saved) {
          const pending = JSON.parse(saved);

          if (
            pending.mode !== "test" ||
            typeof pending.order?.id !== "string" ||
            !pending.keyId?.startsWith("rzp_test_")
          ) {
            throw new Error("Saved payment data is invalid.");
          }

          setOrder(pending);
        }

        const version = ++balanceVersionRef.current;
        const data = await getCredits(controller.signal);

        if (
          !controller.signal.aborted &&
          version === balanceVersionRef.current
        ) {
          setWallet(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      activeRef.current = false;
      controller.abort();
      checkoutRef.current?.close();
    };
  }, []);

  useEffect(() => {
    let controller;

    const updateCredits = (event) => {
      if (
        !Number.isInteger(event.detail) ||
        event.detail < 0
      ) {
        return;
      }

      balanceVersionRef.current += 1;

      setWallet((previous) =>
        previous
          ? { ...previous, credits: event.detail }
          : previous
      );
    };

    const refreshCredits = async () => {
      if (!storageKeyRef.current) return;

      controller?.abort();
      controller = new AbortController();

      const currentController = controller;
      const version = ++balanceVersionRef.current;

      try {
        const data = await getCredits(currentController.signal);

        if (
          !currentController.signal.aborted &&
          version === balanceVersionRef.current
        ) {
          setWallet(data);
        }
      } catch {
        // Keep the last known balance if refreshing fails.
      }
    };

    window.addEventListener(
      "logix:credits-updated",
      updateCredits
    );
    window.addEventListener(
      "logix:credits-refresh",
      refreshCredits
    );
    window.addEventListener("focus", refreshCredits);

    return () => {
      controller?.abort();

      window.removeEventListener(
        "logix:credits-updated",
        updateCredits
      );
      window.removeEventListener(
        "logix:credits-refresh",
        refreshCredits
      );
      window.removeEventListener("focus", refreshCredits);
    };
  }, []);

  const finish = () => {
    busyRef.current = false;

    if (activeRef.current) {
      setIsBusy(false);
    }
  };

  const applyPayment = (data) => {
    if (data.paymentStatus === "paid") {
      sessionStorage.removeItem(storageKeyRef.current);
    }

    if (!activeRef.current) return;

    balanceVersionRef.current += 1;

    setWallet((previous) => ({
      ...previous,
      credits: data.credits,
    }));

    if (data.paymentStatus === "paid") {
      setOrder(null);
      setMessage("Payment verified. Credits added.");
    } else {
      setMessage(
        "Payment is pending. Check payment status shortly."
      );
    }
  };

  const checkPayment = async () => {
    if (!order || busyRef.current) return;

    busyRef.current = true;
    setIsBusy(true);
    setError("");
    setMessage("");

    try {
      const data = await syncPayment(order.order.id);
      applyPayment(data);
    } catch (error) {
      if (activeRef.current) {
        setError(error.message);
      }
    } finally {
      finish();
    }
  };

  const buyCredits = async () => {
    if (
      busyRef.current ||
      isLoading ||
      !wallet ||
      !storageKeyRef.current
    ) {
      return;
    }

    if (!window.Razorpay) {
      setError(
        "Checkout could not load. Refresh the page and try again."
      );
      return;
    }

    busyRef.current = true;
    setIsBusy(true);
    setError("");
    setMessage("");

    try {
      let currentOrder = order;

      if (currentOrder) {
        const result = await syncPayment(currentOrder.order.id);

        if (result.paymentStatus === "paid") {
          applyPayment(result);
          finish();
          return;
        }
      } else {
        currentOrder = await createPaymentOrder();

        if (
          currentOrder.mode !== "test" ||
          !currentOrder.keyId?.startsWith("rzp_test_")
        ) {
          throw new Error(
            "This checkout currently supports Test Mode only."
          );
        }

        sessionStorage.setItem(
          storageKeyRef.current,
          JSON.stringify(currentOrder)
        );

        if (activeRef.current) {
          setOrder(currentOrder);
        }
      }

      if (!activeRef.current) {
        finish();
        return;
      }

      let isVerifying = false;

      const checkout = new window.Razorpay({
        key: currentOrder.keyId,
        order_id: currentOrder.order.id,
        amount: currentOrder.order.amount,
        currency: currentOrder.order.currency,
        name: "LOGIX",
        description:
          `${currentOrder.credits} chatbot messages · Test Mode`,
        theme: {
          color: "#75a7ff",
        },

        handler: async (payment) => {
          isVerifying = true;

          if (activeRef.current) {
            setError("");
            setMessage("Verifying payment…");
          }

          try {
            const data = await verifyPayment(payment);
            applyPayment(data);
          } catch (error) {
            if (activeRef.current) {
              setMessage("");
              setError(
                `${error.message} Check payment status before paying again.`
              );
            }
          } finally {
            finish();
          }
        },

        modal: {
          ondismiss: () => {
            if (isVerifying) return;

            if (activeRef.current) {
              setMessage(
                "Checkout closed. Check or resume your payment."
              );
            }

            finish();
          },
        },
      });

      checkout.on("payment.failed", () => {
        if (activeRef.current) {
          setError(
            "Payment failed. Retry inside checkout, or close it and check payment status."
          );
        }
      });

      checkoutRef.current = checkout;
      checkout.open();
    } catch (error) {
      if (activeRef.current) {
        setError(error.message);
      }

      finish();
    }
  };

  return {
    wallet,
    order,
    isLoading,
    isBusy,
    message,
    error,
    buyCredits,
    checkPayment,
  };
};

export default useChatCredits;