import { useEffect, useRef, useState } from "react";
import { getScanChat, sendScanMessage } from "../api/scan.api";

const useFindingChat = (scanId, findingId) => {
  const conversationKey = `${scanId}:${findingId || "repository"}`;
  const pendingKey = `logix-pending-chat:${conversationKey}`;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);

  const requestRef = useRef(null);

  const isHistoryLoaded = loadedKey === conversationKey;

  useEffect(() => {
    const controller = new AbortController();

    setMessages([]);
    setLoadedKey("");
    setIsLoading(true);
    setIsSending(false);
    setError(null);

    const loadHistory = async () => {
      try {
        if (!scanId) {
          throw new Error("Open a scan before starting chat.");
        }

        const data = await getScanChat(
          scanId,
          findingId,
          controller.signal
        );

        if (controller.signal.aborted) return;

        if (!Array.isArray(data.messages)) {
          throw new Error("Unexpected chat history response.");
        }

        setMessages(data.messages);
        setLoadedKey(conversationKey);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError({
          message:
            error instanceof TypeError
              ? "Cannot load chat. Check your connection."
              : error.message,
          status: error.status,
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      controller.abort();
      requestRef.current?.abort();
      requestRef.current = null;
    };
  }, [scanId, findingId, conversationKey, reload]);

  useEffect(() => {
    setInput("");
  }, [conversationKey]);

  const send = async () => {
    const message = input.trim();

    if (
      !message ||
      !scanId ||
      !isHistoryLoaded ||
      isLoading ||
      requestRef.current
    ) {
      return;
    }

    if (message.length > 2000) {
      setError({
        message: "Keep your message within 2,000 characters.",
      });
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    setIsSending(true);
    setError(null);

    try {
      const savedRequest = JSON.parse(
        sessionStorage.getItem(pendingKey) || "null"
      );

      const pending =
        savedRequest?.message === message &&
        typeof savedRequest.requestId === "string"
          ? savedRequest
          : {
              requestId: crypto.randomUUID(),
              message,
            };

      sessionStorage.setItem(pendingKey, JSON.stringify(pending));

      const data = await sendScanMessage(
        scanId,
        {
          message,
          findingId: findingId || undefined,
          requestId: pending.requestId,
        },
        controller.signal
      );

      if (controller.signal.aborted) return;

      if (
        !Array.isArray(data.messages) ||
        data.messages.length !== 2 ||
        data.messages[0]?.role !== "user" ||
        data.messages[1]?.role !== "assistant" ||
        data.messages.some(
          (item) =>
            typeof item.id !== "string" ||
            typeof item.content !== "string"
        )
      ) {
        throw new Error("Unexpected response. Refresh chat to check.");
      }

      setMessages((previous) => {
        const existingIds = new Set(
          previous.map((item) => item.id)
        );

        return [
          ...previous,
          ...data.messages.filter(
            (item) => !existingIds.has(item.id)
          ),
        ];
      });

      setInput("");

      sessionStorage.removeItem(pendingKey);

      window.dispatchEvent(
        new CustomEvent("logix:credits-updated", {
          detail: data.credits,
        })
      );
    } catch (error) {
      if (controller.signal.aborted) return;

      setError({
        message:
          error instanceof TypeError
            ? "Connection interrupted. Retry the same message or refresh chat."
            : error.message,
        status: error.status,
      });
    } finally {
      window.dispatchEvent(new Event("logix:credits-refresh"));

      if (requestRef.current === controller) {
        requestRef.current = null;
      }

      if (!controller.signal.aborted) {
        setIsSending(false);
      }
    }
  };

  const refreshHistory = () => {
    if (!requestRef.current) {
      setReload((previous) => previous + 1);
    }
  };

  return {
    input,
    setInput,
    messages: isHistoryLoaded ? messages : [],
    isLoading,
    isHistoryLoaded,
    isSending,
    error,
    send,
    refreshHistory,
  };
};

export default useFindingChat;