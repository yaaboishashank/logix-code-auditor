import { Plus } from "lucide-react";

const questions = [
  [
    "Can I try LOGIX right now?",
    "You can compare the sample code on this page. Sign-in, the workspace, and live repository analysis are still being built.",
  ],
  [
    "Does the preview connect to my repository?",
    "No. This page uses a fictional JavaScript payments service. It does not access GitHub or send your code anywhere.",
  ],
  [
    "Will LOGIX change my code?",
    "The planned workflow puts you in control: inspect the evidence, review a suggestion, and decide what belongs in your code. This preview does not modify any repository.",
  ],
  [
    "Why not add a log to every function?",
    "More logs can mean more noise. LOGIX focuses on useful failure context, shared error handlers, and signals that already exist. Secrets and sensitive payloads should stay out of logs.",
  ],
];

const FAQSection = () => (
  <section
    id="questions"
    className="landing-section"
    aria-labelledby="faq-title"
  >
    <div className="landing-container landing-faq">
      <div className="landing-section-intro">
        <h2 id="faq-title">
          Before you<br /><span>dive in.</span>
        </h2>
        <p>A few things to know about the current LOGIX preview.</p>
      </div>

      <div className="landing-questions">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <Plus aria-hidden="true" />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;