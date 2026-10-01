import express from "express";
import { requireAuth } from "#src/middleware/auth.js";
import { StatusCodes as httpCode } from "http-status-codes";

const router = express.Router();

function registerPostRoutes(app, repository) {
  // POST /api/posts
  router.post("/", requireAuth, async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id; // only auth user create posts

    if (typeof content !== "string") {
      return res.status(httpCode.BAD_REQUEST).json({
        error: "content must be a string",
      });
    }

    // reject empty string
    // catch: undefined, null, "" and whitespace "  "
    if (!content || content.trim().length === 0) {
      return res.status(httpCode.BAD_REQUEST).json({
        error: "content is required",
      });
    }

    const post = await repository.createPost(userId, content);

    return res.status(httpCode.CREATED).json({ post });
  });

  // GET /api/posts
  router.get("/", async (req, res) => {
    const posts = await repository.findAll();

    return res.json({ posts });
  });

  // GET /api/posts/:id
  router.get("/:id", async (req, res) => {
    const post = await repository.findById(req.params.id);

    if (!post) {
      return res.status(httpCode.NOT_FOUND).json({
        error: "Post not found",
      });
    }

    return res.json({ post });
  });

  // PATCH /api/posts/:id
  // update your own post only
  router.patch("/:id", requireAuth, async (req, res) => {
    const { content } = req.body;

    const postId = req.params.id;
    const post = await repository.findById(postId);

    if (!post) {
      return res.status(httpCode.NOT_FOUND).json({
        error: "Post not found",
      });
    }

    // check if post belong to user
    if (req.user.id !== post.user_id) {
      return res.status(httpCode.UNAUTHORIZED).json({ error: "unauthorized" });
    }

    const updatedPost = await repository.updatePost(req.params.id, content);

    return res.json({ post: updatedPost });
  });

  // DELETE /api/posts/:id
  router.delete("/:id", requireAuth, async (req, res) => {
    const postId = req.params.id;
    const post = await repository.findById(postId);

    if (!post) {
      return res.status(httpCode.NOT_FOUND).json({
        error: "Post not found",
      });
    }

    if (req.user.id !== post.user_id) {
      return res.status(httpCode.UNAUTHORIZED).json({ error: "unauthorized" });
    }

    const deletedPost = await repository.deletePost(postId);

    return res.json({ post: deletedPost });
  });

  app.use("/api/posts", router);
}

export default registerPostRoutes;
