import express from "express";
import { requireAuth } from "#src/middleware/auth.js";
import { StatusCodes as httpCode } from "http-status-codes";

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
      return res.status(httpCode.NOT_FOUND).json({
        error: "Notification not found",
      });
    }

    return res.json({ notification });
  });

  app.use("/api/notifications", router);
}

export default registerNotificationRoutes;
