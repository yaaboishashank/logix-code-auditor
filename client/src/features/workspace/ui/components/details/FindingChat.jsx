import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import useFindingChat from "../../../hooks/useFindingChat";
import useChatCredits from "../../../../payments/hooks/useChatCredits";
import ChatCredits from "../../../../payments/ui/ChatCredits";
import CreditRequiredDialog from "../../../../payments/ui/CreditRequiredDialog";

const ChatConversation = ({ scanId, findingId }) => {
  const {
    input,
    setInput,
    messages,
    isSending,
    error,
    send,
    isLoading,
    isHistoryLoaded,
    refreshHistory,
  } = useFindingChat(scanId, findingId);

  const payment = useChatCredits();
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const messagesRef = useRef(null);

  const canSend = isHistoryLoaded && !isSending && input.trim();
  const needsCredits = error?.status === 402;

  useEffect(() => {
    const container = messagesRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages.length, isSending]);

  useEffect(() => {
    if (error?.status === 402) {
      setShowCreditPopup(true);
    }
  }, [error]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (canSend) void send();
  };

  const handleBuyCredits = () => {
    setShowCreditPopup(false);
    void payment.buyCredits();
  };

  return (
    <section className="finding-chat" aria-label="Repository assistant">
      <header className="finding-chat-header">
        <h3>Ask LOGIX</h3>
        <p>Discuss this finding and your repository.</p>
      </header>

      <div
        ref={messagesRef}
        className="finding-chat-messages"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        tabIndex={0}
      >
        {isLoading ? (
          <p role="status">Loading your conversation…</p>
        ) : isHistoryLoaded && !messages.length ? (
          <p className="finding-chat-empty">
            Try: “Why is logging needed here?”
          </p>
        ) : null}

        {messages.map((message, index) => (
          <article
            key={message.id || index}
            className={`finding-chat-message is-${message.role}`}
          >
            <strong>
              {message.role === "user" ? "You" : "LOGIX"}
            </strong>

            <div className="finding-chat-answer">
              {message.content}
            </div>

            {message.sources?.length > 0 && (
              <div className="finding-chat-sources">
                <span>Code references</span>

                <ul>
                  {message.sources.map((source) => (
                    <li key={source.id}>
                      {source.path}:{source.startLine}–{source.endLine}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>

      {isSending && (
        <p className="finding-chat-wait" role="status">
          <span className="finding-chat-spinner" aria-hidden="true" />
          Searching code and preparing an answer…
        </p>
      )}

      {error && !needsCredits && (
        <div className="scan-error" role="alert">
          <p>
            {error.message}{" "}
            {error.status === 401 && (
              <Link to="/login">Log in again</Link>
            )}
          </p>

          {error.status !== 401 && (
            <button
              type="button"
              onClick={refreshHistory}
              disabled={isLoading || isSending}
            >
              Refresh chat
            </button>
          )}
        </div>
      )}

      <form className="finding-chat-form" onSubmit={handleSubmit}>
        <label className="finding-chat-field">
          <span>Your question</span>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();

                if (canSend) {
                  event.currentTarget.form?.requestSubmit();
                }
              }
            }}
            placeholder="Ask about this error, logging, or code…"
            rows={2}
            maxLength={2000}
            disabled={isSending || !isHistoryLoaded}
            required
          />
        </label>

        <div className="finding-chat-submit-area">
          <ChatCredits payment={payment} />

          <button
            type="submit"
            className="ui-button"
            disabled={!canSend}
          >
            {isSending ? "Thinking…" : "Send"}
          </button>
        </div>
      </form>

      <CreditRequiredDialog
        open={showCreditPopup}
        onClose={() => setShowCreditPopup(false)}
        onBuy={handleBuyCredits}
        disabled={
          payment.isLoading ||
          payment.isBusy ||
          !payment.wallet
        }
      />
    </section>
  );
};

const FindingChat = ({ findingId }) => {
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get("scan");

  if (!scanId) return null;

  return (
    <ChatConversation
      key={`${scanId}:${findingId || "repository"}`}
      scanId={scanId}
      findingId={findingId}
    />
  );
};

export default FindingChat;