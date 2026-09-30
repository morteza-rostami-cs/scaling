import express from "express";
import registerRoutes from "#core";
import { requestLogger } from "./middleware/requestLogger.js";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler.js";

// import { printRoutes } from "#src/utils/printRoutes.js";

const app = express();

// request logger middleware
app.use(requestLogger);
// parsing cookies
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ message: "home" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// register routes
registerRoutes(app);

// global error handler (should come after all routes)
// all routes pass errors here
app.use(errorHandler);

export default app;
