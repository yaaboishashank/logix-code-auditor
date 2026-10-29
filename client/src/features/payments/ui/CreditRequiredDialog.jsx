import { useEffect, useRef } from "react";

const CreditRequiredDialog = ({
  open,
  onClose,
  onBuy,
  disabled,
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="credit-required-dialog"
      aria-labelledby="credit-dialog-title"
      aria-describedby="credit-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <button
        type="button"
        className="credit-dialog-close"
        aria-label="Close"
        onClick={onClose}
      >
        ×
      </button>

      <span className="credit-dialog-label">LOGIX CHAT</span>

      <h2 id="credit-dialog-title">You’re out of credits</h2>

      <p id="credit-dialog-description">
        Buy message credits to continue chatting with LOGIX.
        Your conversation is saved.
      </p>

      <div className="credit-dialog-actions">
        <button
          type="button"
          className="ui-button"
          onClick={onBuy}
          disabled={disabled}
          autoFocus
        >
          Buy credits
        </button>

        <button
          type="button"
          className="credit-dialog-later"
          onClick={onClose}
        >
          Maybe later
        </button>
      </div>
    </dialog>
  );
};

export default CreditRequiredDialog;