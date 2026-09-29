import express from "express";

const router = express.Router();

function registerUserRoutes(app, repository) {
  // GET /users
  router.get("/", async (req, res) => {
    const users = await repository.findAll();

    return res.json({ users: users });
  });

  // GET /api/users/:id
  router.get("/:id", async (req, res) => {
    const user = await repository.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({ user });
  });

  // PATCH /api/users/:id
  router.patch("/:id", async (req, res) => {
    const { username, email } = req.body;

    const user = await repository.updateUser(req.params.id, username, email);

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
