import Button from "../../../../../shared/ui/components/Button";

const ReviewActions = ({ status, onChange, message }) => (
  <section className="finding-review" aria-label="Review finding">
    <div className="finding-review-controls">
      <span className={`finding-review-status ${status}`}>{status}</span>

      {status === "open" ? (
        <>
          <Button onClick={() => onChange("reviewed")}>
            Mark reviewed
          </Button>

          <Button
            className="review-secondary"
            onClick={() => onChange("dismissed")}
          >
            Dismiss
          </Button>
        </>
      ) : (
        <Button
          className="review-secondary"
          onClick={() => onChange("open")}
        >
          Reopen finding
        </Button>
      )}
    </div>

    <p className="finding-review-message" role="status">{message}</p>
  </section>
);

export default ReviewActions;