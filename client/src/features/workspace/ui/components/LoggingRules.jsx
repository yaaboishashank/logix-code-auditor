import { useEffect, useRef, useState } from "react";
import Button from "../../../../shared/ui/components/Button";
import {
  getLoggingRules,
  saveLoggingRules,
} from "../../api/scan.api";

const rules = [
  { id: "errors", label: "Error handlers" },
  { id: "requests", label: "External API requests" },
  { id: "database", label: "Database operations" },
  { id: "retries", label: "Retries and fallbacks" },
];

const ruleIds = rules.map((rule) => rule.id);

const isValidRules = (selected) =>
  Array.isArray(selected) &&
  selected.length > 0 &&
  selected.length <= ruleIds.length &&
  selected.every((id) => ruleIds.includes(id)) &&
  new Set(selected).size === selected.length;

const LoggingRules = () => {
  const [selectedRules, setSelectedRules] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reload, setReload] = useState(0);

  const saveControllerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsLoading(true);
    setIsLoaded(false);
    setIsSaving(false);
    setMessage("");

    const loadRules = async () => {
      try {
        const data = await getLoggingRules(controller.signal);

        if (controller.signal.aborted) return;

        if (!isValidRules(data.loggingRules)) {
          throw new Error("Unexpected preferences response.");
        }

        setSelectedRules(data.loggingRules);
        setIsLoaded(true);
      } catch (error) {
        if (controller.signal.aborted) return;

        setMessage(
          error instanceof TypeError
            ? "Cannot connect to the server. Please retry."
            : error.message,
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadRules();

    return () => {
      controller.abort();
      saveControllerRef.current?.abort();
      saveControllerRef.current = null;
    };
  }, [reload]);

  const toggleRule = (id) => {
    setSelectedRules((previous) =>
      previous.includes(id)
        ? previous.filter((rule) => rule !== id)
        : [...previous, id],
    );

    setMessage("");
  };

  const saveRules = async (event) => {
    event.preventDefault();

    if (!isLoaded || saveControllerRef.current) return;

    if (!isValidRules(selectedRules)) {
      setMessage("Select at least one rule.");
      return;
    }

    const controller = new AbortController();
    saveControllerRef.current = controller;

    setIsSaving(true);
    setMessage("");

    try {
      const data = await saveLoggingRules(
        selectedRules,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      if (!isValidRules(data.loggingRules)) {
        throw new Error("Could not confirm save. Refresh this page.");
      }

      setSelectedRules(data.loggingRules);
      setMessage("Preferences saved. They apply to new scans.");
    } catch (error) {
      if (controller.signal.aborted) return;

      setMessage(
        error instanceof TypeError
          ? "Could not confirm save. Check your connection and refresh."
          : error.message,
      );
    } finally {
      if (saveControllerRef.current === controller) {
        saveControllerRef.current = null;
      }

      if (!controller.signal.aborted) {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return <p role="status">Loading your preferences…</p>;
  }

  if (!isLoaded) {
    return (
      <div className="settings-actions">
        <p role="alert">{message}</p>

        <Button
          type="button"
          onClick={() => setReload((previous) => previous + 1)}
        >
          Try again
        </Button>
      </div>
    );
  }

  return (
    <form className="settings-form" onSubmit={saveRules}>
      {rules.map((rule) => (
        <label className="logging-rule" key={rule.id}>
          <span>{rule.label}</span>

          <input
            type="checkbox"
            checked={selectedRules.includes(rule.id)}
            onChange={() => toggleRule(rule.id)}
            disabled={isSaving}
          />
        </label>
      ))}

      <div className="settings-actions">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save preferences"}
        </Button>

        <p role="status">{message}</p>
      </div>
    </form>
  );
};

export default LoggingRules;