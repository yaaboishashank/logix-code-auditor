import { useEffect, useRef } from "react";
import { LockKeyhole } from "lucide-react";
import Button from "../../../../shared/ui/components/Button";

const WorkspaceNotice = ({ onClose }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;

    dialog.showModal();
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="workspace-notice"
      aria-labelledby="workspace-title"
      aria-describedby="workspace-description"
      onCancel={onClose}
    >
      <LockKeyhole aria-hidden="true" />

      <h2 id="workspace-title">Your workspace is up next.</h2>

      <p id="workspace-description">
        Sign-in and workspace access are coming next. For now, explore
        the sample code on this page. No account or repository is connected.
      </p>

      <Button onClick={onClose}>Back to LOGIX</Button>
    </dialog>
  );
};

export default WorkspaceNotice;