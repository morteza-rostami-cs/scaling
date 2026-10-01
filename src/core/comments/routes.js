import express from "express";
import { requireAuth } from "#src/middleware/auth.js";
import { StatusCodes as httpCode } from "http-status-codes";

const router = express.Router();

function registerCommentRoutes(app, repository) {
  // POST /api/posts/:postId/comments
  router.post("/posts/:postId/comments", requireAuth, async (req, res) => {
    const { content } = req.body;

    const userId = req.user.id;

    const comment = await repository.createComment(
      req.params.postId,
      userId,
      content,
    );

    return res.status(httpCode.CREATED).json({ comment });
  });

  // GET /api/posts/:postId/comments
  router.get("/posts/:postId/comments", async (req, res) => {
    const comments = await repository.findByPostId(req.params.postId);

    return res.status(httpCode.OK).json({ comments });
  });

  // DELETE /api/comments/:id
  router.delete("/comments/:id", requireAuth, async (req, res) => {
    const commentId = req.params.id;
    const comment = await repository.findById(commentId);

    if (!comment) {
      return res.status(httpCode.NOT_FOUND).json({
        error: "Comment not found",
      });
    }

    // user can only delete their own comment
    if (req.user.id !== comment.user_id) {
      return res.status(httpCode.UNAUTHORIZED).json({
        error: "unauthorized",
      });
    }

    const deletedComment = await repository.deleteComment(commentId);

    return res.status(httpCode.OK).json({ comment: deletedComment });
  });

  app.use("/api", router);
}

export default registerCommentRoutes;
