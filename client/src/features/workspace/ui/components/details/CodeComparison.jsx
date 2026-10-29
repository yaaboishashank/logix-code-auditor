const CodeComparison = ({ originalCode, suggestedCode }) => (
  <div className="finding-code-comparison">
    <section className="finding-code-pane">
      <h3>Original code</h3>

      <pre tabIndex={0} aria-label="Original source code">
        <code>{originalCode}</code>
      </pre>
    </section>

    <section className="finding-code-pane">
      <h3>Suggested logging</h3>

      <pre tabIndex={0} aria-label="Suggested replacement code">
        <code>{suggestedCode}</code>
      </pre>
    </section>
  </div>
);

export default CodeComparison;