const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Email is already registered",
    });
  }

  if (error.name === "ValidationError" || error.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid request data",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large",
    });
  }

  console.error("Request failed:", req.method, req.path, error.name);

  res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
};

export default errorHandler;