import express from "express";

const router = express.Router();

function registerPostRoutes(app, repository) {
  // POST /api/posts
  router.post("/", async (req, res) => {
    const { userId, content } = req.body;

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
  router.patch("/:id", async (req, res) => {
    const { content } = req.body;

    const post = await repository.updatePost(req.params.id, content);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    return res.json({ post });
  });

  // DELETE /api/posts/:id
  router.delete("/:id", async (req, res) => {
    const post = await repository.deletePost(req.params.id);

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    return res.json({ post });
  });

  app.use("/api/posts", router);
}

export default registerPostRoutes;
