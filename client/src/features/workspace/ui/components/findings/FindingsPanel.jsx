import FindingCard from "./FindingCard";

const FindingsPanel = ({ findings, selectedId, onSelect }) => (
  <section
    className="findings-panel"
    aria-label="Findings list"
    tabIndex={0}
  >
    {findings.length ? (
      <ul className="findings-list">
        {findings.map((finding) => (
          <li key={finding.id}>
            <FindingCard
              finding={finding}
              selected={finding.id === selectedId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    ) : (
     <p className="findings-empty">No matching findings.</p>
    )}
  </section>
);

export default FindingsPanel;