import express from "express";

const router = express.Router();

function registerCommentRoutes(app, repository) {
  // POST /api/posts/:postId/comments
  router.post("/posts/:postId/comments", async (req, res) => {
    const { userId, content } = req.body;

    const comment = await repository.createComment(
      req.params.postId,
      userId,
      content,
    );

    return res.status(201).json({ comment });
  });

  // GET /api/posts/:postId/comments
  router.get("/posts/:postId/comments", async (req, res) => {
    const comments = await repository.findByPostId(req.params.postId);

    return res.json({ comments });
  });

  // DELETE /api/comments/:id
  router.delete("/comments/:id", async (req, res) => {
    const comment = await repository.deleteComment(req.params.id);

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    return res.json({ comment });
  });

  app.use("/api", router);
}

export default registerCommentRoutes;
