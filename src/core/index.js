import { db } from "#src/db/connection.js";

// repositories
import UserRepository from "./users/repository.js";
import PostRepository from "./posts/repository.js";
import CommentRepository from "./comments/repository.js";
import SessionRepository from "./sessions/repository.js";
import FollowRepository from "./follows/repository.js";
import NotificationRepository from "./notifications/repository.js";
import FeedRepository from "./feed/repository.js";
import LikeRepository from "./likes/repository.js";

// routes
import registerUserRoutes from "./users/routes.js";
import registerPostRoutes from "./posts/routes.js";
import registerCommentRoutes from "./comments/routes.js";
import registerAuthRoutes from "./auth/routes.js";
import registerFollowRoutes from "./follows/routes.js";
import registerNotificationRoutes from "./notifications/routes.js";
import registerFeedRoutes from "./feed/routes.js";
import registerLikeRoutes from "./likes/routes.js";

// register repositories
export const userRepository = new UserRepository(db);
export const sessionRepository = new SessionRepository(db);
const postRepository = new PostRepository(db);
const commentRepository = new CommentRepository(db);
const followRepository = new FollowRepository(db);
const notificationRepository = new NotificationRepository(db);
const feedRepository = new FeedRepository(db);
const likeRepository = new LikeRepository(db);

function registerRoutes(app) {
  // register routes
  registerUserRoutes(app, userRepository);
  registerAuthRoutes(app, userRepository, sessionRepository);
  registerPostRoutes(app, postRepository);
  registerCommentRoutes(app, commentRepository);
  registerFollowRoutes(app, followRepository);
  registerNotificationRoutes(app, notificationRepository);
  registerFeedRoutes(app, feedRepository);
  registerLikeRoutes(app, likeRepository);
}

export default registerRoutes;
