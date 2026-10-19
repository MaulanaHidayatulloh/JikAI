export function errorHandler(error, req, res, next) {
  console.error("JikAI API error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || error.status || 500;

  if (statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: "API key Groq tidak valid. Periksa konfigurasi server/.env.",
    });
  }

  if (statusCode === 429) {
    return res.status(429).json({
      success: false,
      message: "Batas penggunaan AI tercapai. Silakan tunggu dan coba lagi.",
    });
  }

  if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Permintaan tidak valid.",
    });
  }

  return res
    .status(statusCode >= 500 && statusCode < 600 ? statusCode : 500)
    .json({
      success: false,
      message:
        statusCode === 503
          ? error.message
          : statusCode === 502
            ? error.message
            : "Terjadi kesalahan pada server JikAI. Periksa terminal backend.",
    });
}
