import "../payments.css";

const ChatCredits = ({ payment }) => {
  const {
    wallet,
    order,
    isLoading,
    isBusy,
    message,
    error,
    buyCredits,
    checkPayment,
  } = payment;

  return (
    <section className="chat-credits" aria-label="Chat credits">
      <div className="chat-credits-row">
        <span role="status">
          {isLoading
            ? "Loading…"
            : wallet
              ? `${wallet.credits} credits left`
              : "Unavailable"}
        </span>

        <button
          type="button"
          className="chat-credits-buy"
          onClick={buyCredits}
          disabled={isLoading || isBusy || !wallet}
          aria-label={
            order
              ? "Resume test payment"
              : `Buy ${wallet?.pack?.credits ?? 5} message credits in Test Mode`
          }
        >
          {isBusy
            ? "Wait…"
            : order
              ? "Resume"
              : `+${wallet?.pack?.credits ?? 5} · ₹${
                  (wallet?.pack?.amount ?? 100) / 100
                }`}
        </button>
      </div>

      {order && (
        <button
          type="button"
          className="chat-payment-check"
          onClick={checkPayment}
          disabled={isLoading || isBusy}
        >
          Check payment
        </button>
      )}

      {(message || error) && (
        <p
          className={error ? "chat-payment-error" : ""}
          role={error ? "alert" : "status"}
        >
          {error || message}
        </p>
      )}
    </section>
  );
};

export default ChatCredits;