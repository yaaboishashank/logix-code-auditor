export const LOGGING_RULES = {
  errors:
    "General error handlers outside external requests, database operations, and retry or fallback flows.",
  requests:
    "Failures of outgoing HTTP requests and external API calls.",
  database:
    "Failures of database reads, writes, connections, and transactions.",
  retries:
    "Retry attempts, exhausted retries, and fallback activation.",
};

export const DEFAULT_LOGGING_RULES = Object.keys(LOGGING_RULES);

export const isValidLoggingRules = (rules) =>
  Array.isArray(rules) &&
  rules.length > 0 &&
  rules.length <= DEFAULT_LOGGING_RULES.length &&
  rules.every((rule) => DEFAULT_LOGGING_RULES.includes(rule)) &&
  new Set(rules).size === rules.length;