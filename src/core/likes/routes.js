import express from "express";
import requireAuth from "#src/middleware/auth.js";

const router = express.Router();

function registerLikeRoutes(app, repository) {
  // POST /api/posts/:postId/like
  router.post("/posts/:postId/like", requireAuth, async (req, res) => {
    // const { userId } = req.body;

    const userId = req.user.id;

    const like = await repository.createLike(userId, req.params.postId);

    return res.status(201).json({ like });
  });

  // DELETE /api/posts/:postId/like
  router.delete("/posts/:postId/like", requireAuth, async (req, res) => {
    // const { userId } = req.body;

    const userId = req.user.id;

    const like = await repository.deleteLike(userId, req.params.postId);

    if (!like) {
      return res.status(404).json({
        error: "Like not found",
      });
    }

    return res.json({ like });
  });

  app.use("/api", router);
}

export default registerLikeRoutes;
