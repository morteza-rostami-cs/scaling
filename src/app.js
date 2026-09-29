import express from "express";
import registerRoutes from "#core";
import { requestLogger } from "./middleware/requestLogger.js";

const app = express();

// request logger middleware
app.use(requestLogger);
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

export default app;
