export const sampleCode = [
  {
    label: "The quiet failure",
    code: `async function chargePayment(payment, requestId) {
  try {
    return await gateway.charge(payment);
  } catch (error) {
    // Something failed. The context is gone.
    return null;
  }
}`,
  },
  {
    label: "A useful signal",
    code: `async function chargePayment(payment, requestId) {
  try {
    return await gateway.charge(payment);
  } catch (error) {
    logger.error("payment_charge_failed", {
      requestId,
      errorType: error.name,
    });
    return null;
  }
}`,
  },
];