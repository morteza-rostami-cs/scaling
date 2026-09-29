import express from "express";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ message: "home" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

export default app;
