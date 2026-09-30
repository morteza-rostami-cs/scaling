// src/core/middleware/requestLogger.js

const METHOD_EMOJI = {
  GET: "📥",
  POST: "📤",
  PUT: "✏️",
  PATCH: "🩹",
  DELETE: "🗑️",
  OPTIONS: "⚙️",
  HEAD: "🔍",
};

export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const emoji = METHOD_EMOJI[req.method] ?? "❓";

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const status = res.statusCode;

    let statusEmoji;
    if (status >= 500) {
      statusEmoji = "💥";
    } else if (status >= 400) {
      statusEmoji = "❌";
    } else if (status >= 300) {
      statusEmoji = "↪️";
    } else if (status >= 200) {
      statusEmoji = "✅";
    } else {
      statusEmoji = "❔";
    }

    const time = new Date().toISOString();
    const ip = req.ip ?? req.socket?.remoteAddress ?? "-";

    console.log(
      `${emoji} ${statusEmoji} [${time}] ${req.method} ${req.originalUrl} ` +
        `${status} ${durationMs.toFixed(1)}ms — ${ip}`,
    );
  });

  next();
}
