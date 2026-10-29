import { useState } from "react";
import { Copy } from "lucide-react";
import CodeBlock from "../../../../../shared/ui/components/CodeBlock";

const CodeEvidence = ({ code }) => {
  const [status, setStatus] = useState("");

  const copyCode = async () => {
    setStatus("copying");

    try {
      await navigator.clipboard.writeText(code);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="finding-detail-section">
      <div className="evidence-heading">
        <h3>Code evidence</h3>

        <button
          type="button"
          className="evidence-copy"
          onClick={copyCode}
          disabled={status === "copying"}
        >
          <Copy aria-hidden="true" />
          {status === "copying" ? "Copying…" : "Copy code"}
        </button>
      </div>

      <div className="finding-code">
        <CodeBlock code={code} />
      </div>

      <p className="evidence-copy-status" role="status">
        {status === "copied" && "Code copied."}
        {status === "error" &&
          "Couldn’t copy. Select the code and copy it manually."}
      </p>
    </section>
  );
};

export default CodeEvidence;