const SessionStatus = ({ error = false }) => (
  <main
    style={{
      minHeight: "100svh",
      display: "grid",
      placeItems: "center",
    }}
  >
    <section className="workspace-notice">
      <h2>{error ? "Connection problem" : "Welcome to LOGIX"}</h2>

      <p role={error ? "alert" : "status"}>
        {error
          ? "We couldn't verify your session. Please try again."
          : "Checking your session…"}
      </p>

      {error && (
        <button
          type="button"
          className="ui-button"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      )}
    </section>
  </main>
);

export default SessionStatus;