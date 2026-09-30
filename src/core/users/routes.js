import express from "express";
import { requireAuth } from "#src/middleware/auth.js";

const router = express.Router();

function registerUserRoutes(app, repository) {
  // GET /users
  router.get("/", async (req, res) => {
    const users = await repository.findAll();

    return res.json({ users: users });
  });

  // GET /api/users/:id
  // get any user profile info (public)
  router.get("/:id", async (req, res) => {
    const user = await repository.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({ user });
  });

  // PATCH /api/users/
  // only auth user -- can update their own profile
  router.patch("", requireAuth, async (req, res) => {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: "username required",
      });
    }

    const authUser = req.user;

    // req.params.id
    const user = await repository.updateUser(authUser.id, username);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({ user });
  });

  app.use("/api/users", router);
}

export default registerUserRoutes;
