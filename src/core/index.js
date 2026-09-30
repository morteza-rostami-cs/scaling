import { db } from "#src/db/connection.js";

// repositories
import UserRepository from "./users/repository.js";
import PostRepository from "./posts/repository.js";
import CommentRepository from "./comments/repository.js";
import SessionRepository from "./sessions/repository.js";

// routes
import registerUserRoutes from "./users/routes.js";
import registerPostRoutes from "./posts/routes.js";
import registerCommentRoutes from "./comments/routes.js";
import registerAuthRoutes from "./auth/routes.js";

// register repositories
export const userRepository = new UserRepository(db);
export const sessionRepository = new SessionRepository(db);
const postRepository = new PostRepository(db);
const commentRepository = new CommentRepository(db);

function registerRoutes(app) {
  // register routes
  registerUserRoutes(app, userRepository);
  registerAuthRoutes(app, userRepository, sessionRepository);
  registerPostRoutes(app, postRepository);
  registerCommentRoutes(app, commentRepository);
}

export default registerRoutes;
