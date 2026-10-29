const mockFindings = [
  {
    id: "F-001",
    title: "Order failure returns without a log",
    file: "src/services/order.service.js",
    line: 24,
    severity: "high",
    code: `async function saveOrder(order) {
  try {
    const result = await orderRepository.create(order);

    await paymentService.charge({
      orderId: result.id,
      amount: result.total,
    });

    return result;
  } catch (error) {
    return null;
  }
}`,
    analysis:
      "Database and payment failures reach the same catch block. Returning null hides which operation failed. This snippet does not show a failure log.",
    suggestion:
      "Record the failed operation and a correlation ID before returning. Check existing service logging first, and avoid logging payment details.",
  },
  {
    id: "F-002",
    title: "External request has no visible failure log",
    file: "src/services/github.service.js",
    line: 12,
    severity: "high",
    code: `async function fetchRepository(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Repository request failed");
  }

  return response.json();
}`,
    analysis:
      "The request can fail through a network error or an unsuccessful response. No local failure event is visible; the caller may already handle logging.",
    suggestion:
      "Check the shared request handler. If it does not log failures, record the response status and operation name without exposing authorization headers.",
  },
  {
    id: "F-003",
    title: "Retry attempts are not observable",
    file: "src/workers/scan.worker.js",
    line: 38,
    severity: "medium",
    code: `async function runScan(repository) {
  try {
    return await scanRepository(repository);
  } catch (error) {
    return retryScan(repository);
  }
}`,
    analysis:
      "A retry starts after failure, but the snippet does not record the retry attempt. Repeated retries could be difficult to investigate.",
    suggestion:
      "Record the scan ID, attempt number and retry reason. Check whether the queue already emits these events before adding another log.",
  },
  {
    id: "F-004",
    title: "Database failure needs a logging boundary",
    file: "src/repositories/finding.repository.js",
    line: 8,
    severity: "medium",
    code: `async function saveFindings(findings) {
  return Finding.insertMany(findings);
}`,
    analysis:
      "Database errors propagate to the caller. Missing logging here is only a problem if no higher-level handler records the failure.",
    suggestion:
      "Verify the scan worker's error handler. Log the failed operation once at that boundary instead of duplicating the same error across layers.",
  },
  {
    id: "F-005",
    title: "Cache fallback is not visible",
    file: "src/services/cache.service.js",
    line: 19,
    severity: "low",
    code: `async function readSummary(key) {
  const cached = await cache.get(key);

  if (cached) return cached;

  return loadSummary(key);
}`,
    analysis:
      "Cache misses fall back to the database. This can be normal behavior and does not necessarily require an application log.",
    suggestion:
      "Prefer a cache-hit metric. Add sampled debug logging only when it helps investigate unexpected cache misses.",
  },
];

export default mockFindings;