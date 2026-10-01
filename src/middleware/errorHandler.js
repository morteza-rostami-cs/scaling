import settings from "#config/settings.js";

export function errorHandler(err, req, res, next) {
  //actual error on dev
  console.error("REQUEST ERROR");
  console.error(err);

  // PostgreSQL: unique violation
  if (err.code === "23505") {
    return res.status(409).json({
      error: "Resource already exists",
    });
  }

  // PostgreSQL: foreign key violation
  if (err.code === "23503") {
    return res.status(400).json({
      error: "Invalid related resource",
    });
  }

  // PostgreSQL: check constraint violation
  if (err.code === "23514") {
    return res.status(400).json({
      error: "Invalid data",
    });
  }

  // PostgreSQL: invalid input syntax
  if (err.code === "22P02") {
    return res.status(400).json({
      error: "Invalid input",
    });
  }

  // cover express and json error and so on
  // they provide status like: 400 and so on
  if (err.status || err.statusCode) {
    // get status from this or that
    const status = err.status ?? err.statusCode;

    let message;
    // do not show above 500 errors to client -- in production
    if (status >= 500 && settings.nodeEnv === "production") {
      message = "Internal server error";
    } else {
      message = err.message;
    }

    return res.status(status).json({
      error: message,
    });
  }

  // Everything else -- for what ever that has not status code
  return res.status(500).json({
    error: "Internal server error",
  });
}
