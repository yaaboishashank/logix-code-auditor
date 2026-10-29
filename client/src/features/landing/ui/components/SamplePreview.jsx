import { useState } from "react";
import { CircleAlert, GitBranch, ScanLine, ShieldCheck } from "lucide-react";
import CodeBlock from "../../../../shared/ui/components/CodeBlock";
import { sampleCode } from "../../data/sampleCode";

const SamplePreview = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleKeyDown = (event) => {
    const keys = {
      ArrowRight: 1 - activeTab,
      ArrowLeft: 1 - activeTab,
      Home: 0,
      End: 1,
    };

    if (!(event.key in keys)) return;

    event.preventDefault();
    const next = keys[event.key];

    setActiveTab(next);
    event.currentTarget.parentElement.children[next].focus();
  };

  return (
    <div id="sample" className="landing-example">
      <div className="landing-example-top">
        <span><GitBranch aria-hidden="true" /> payments-api / main</span>
        <span className="landing-sample-tag">SAMPLE</span>
      </div>

      <div className="landing-example-file">
        <span className="js-icon">JS</span>
        <span>services / <strong>payment.js</strong></span>
        <ScanLine aria-hidden="true" />
      </div>

      <div className="landing-code">
        <div role="tablist" aria-label="Compare the sample logging context">
          {sampleCode.map(({ label }, index) => (
            <button
              key={label}
              id={`sample-tab-${index}`}
              role="tab"
              aria-selected={activeTab === index}
              aria-controls="sample-panel"
              tabIndex={activeTab === index ? 0 : -1}
              onClick={() => setActiveTab(index)}
              onKeyDown={handleKeyDown}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          id="sample-panel"
          role="tabpanel"
          aria-labelledby={`sample-tab-${activeTab}`}
        >
          <CodeBlock code={sampleCode[activeTab].code} />
        </div>
      </div>

      <div className="landing-observation">
        <span className="landing-observation-icon">
          <CircleAlert aria-hidden="true" />
        </span>
        <div>
          <strong>A small change. Useful context.</strong>
          <p>
            Compare the silent catch with a recorded event, request ID,
            and error type. The return value stays the same; the next
            investigation has a starting point.
          </p>
        </div>
      </div>

      <div className="landing-example-bottom">
        <span>
          <ShieldCheck aria-hidden="true" />
          Review the context. You make the call.
        </span>
        <span>LOGIX</span>
      </div>
    </div>
  );
};

export default SamplePreview;