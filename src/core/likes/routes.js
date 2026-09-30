import express from "express";

const router = express.Router();

function registerLikeRoutes(app, repository) {
  // POST /api/posts/:postId/like
  router.post("/posts/:postId/like", async (req, res) => {
    const { userId } = req.body;

    const like = await repository.createLike(userId, req.params.postId);

    return res.status(201).json({ like });
  });

  // DELETE /api/posts/:postId/like
  router.delete("/posts/:postId/like", async (req, res) => {
    const { userId } = req.body;

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
