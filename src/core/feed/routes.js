import express from "express";
import { requireAuth } from "#src/middleware/auth.js";

const router = express.Router();

function registerFeedRoutes(app, repository) {
  router.get("/", requireAuth, async (req, res) => {
    const posts = await repository.findFeed(req.user.id);

    return res.json({ posts });
  });

  app.use("/api/feed", router);
}

export default registerFeedRoutes;
