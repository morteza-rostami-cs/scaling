import express from "express";
import { requireAuth } from "#src/middleware/auth.js";

const router = express.Router();

function registerFollowRoutes(app, repository) {
  // POST /api/users/:id/follow
  router.post("/users/:id/follow", requireAuth, async (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;

    try {
      const follow = await repository.createFollow(followerId, followingId);

      return res.status(201).json({ follow });
    } catch (error) {
      return res.status(500).json({
        error: error,
      });
    }
  });

  // DELETE /api/users/:id/follow
  router.delete("/users/:id/follow", requireAuth, async (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;

    const follow = await repository.deleteFollow(followerId, followingId);

    if (!follow) {
      return res.status(404).json({
        error: "Follow not found",
      });
    }

    return res.json({ follow });
  });

  // GET /api/users/:id/followers
  router.get("/users/:id/followers", async (req, res) => {
    const followers = await repository.findFollowers(req.params.id);

    return res.json({ followers });
  });

  // GET /api/users/:id/following
  router.get("/users/:id/following", async (req, res) => {
    const following = await repository.findFollowing(req.params.id);

    return res.json({ following });
  });

  app.use("/api", router);
}

export default registerFollowRoutes;
