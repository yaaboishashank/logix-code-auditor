import LoggingRules from "../components/LoggingRules";

const SettingsPage = () => (
  <section className="settings-page" aria-labelledby="logging-rules-title">
    <header className="settings-heading">
      <h2 id="logging-rules-title">Logging rules</h2>
      <p>Choose checks for new repository scans.</p>
    </header>

    <LoggingRules />

    <p className="settings-note">
      Saved to your account. Changes apply to new scans.
    </p>
  </section>
);

export default SettingsPage;