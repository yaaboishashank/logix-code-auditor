import { useState } from "react";

const ScanFiles = ({ files }) => {
  const [selectedPath, setSelectedPath] = useState("");

  if (!files.length) return null;

  const file =
    files.find((item) => item.path === selectedPath) || files[0];

  return (
    <section className="scan-files" aria-label="Fetched source files">
      <label className="scan-field">
        <span>Source files ({files.length})</span>

        <select
          value={file.path}
          onChange={(event) => setSelectedPath(event.target.value)}
        >
          {files.map((item) => (
            <option key={item.path} value={item.path}>
              {item.path}
            </option>
          ))}
        </select>
      </label>

      <p className="scan-note">
        {(file.size / 1024).toFixed(1)} KB
      </p>

      <pre
        tabIndex={0}
        aria-label={`Source code: ${file.path}`}
      >
        <code>{file.content}</code>
      </pre>
    </section>
  );
};

export default ScanFiles;