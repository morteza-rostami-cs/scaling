import express from "express";
import { requireAuth } from "#src/middleware/auth.js";

const router = express.Router();

function registerPostRoutes(app, repository) {
  // POST /api/posts
  router.post("/", requireAuth, async (req, res) => {
    const { content } = req.body;

    const userId = req.user.id; // only auth user create posts

    const post = await repository.createPost(userId, content);

    return res.status(201).json({ post });
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
      return res.status(404).json({
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
      return res.status(404).json({
        error: "Post not found",
      });
    }

    // check if post belong to user
    if (req.user.id !== post.user_id) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const updatedPost = await repository.updatePost(req.params.id, content);

    return res.json({ post: updatedPost });
  });

  // DELETE /api/posts/:id
  router.delete("/:id", requireAuth, async (req, res) => {
    const postId = req.params.id;
    const post = await repository.findById(postId);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    if (req.user.id !== post.user_id) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const deletedPost = await repository.deletePost(postId);

    return res.json({ post: deletedPost });
  });

  app.use("/api/posts", router);
}

export default registerPostRoutes;
