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

  // Everything else
  return res.status(500).json({
    error: "Internal server error",
  });
}
