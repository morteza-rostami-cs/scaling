import express from "express";
import { requireAuth } from "#src/middleware/auth.js";

const router = express.Router();

function registerNotificationRoutes(app, repository) {
  router.get("/", requireAuth, async (req, res) => {
    const notifications = await repository.findByUserId(req.user.id);

    return res.json({ notifications });
  });

  router.patch("/:id/read", requireAuth, async (req, res) => {
    const notification = await repository.markAsRead(
      req.params.id,
      req.user.id,
    );

    if (!notification) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }

    return res.json({ notification });
  });

  app.use("/api/notifications", router);
}

export default registerNotificationRoutes;
