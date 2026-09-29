import { db } from "#src/db/connection.js";

// repositories
import UserRepository from "./users/repository.js";
import PostRepository from "./posts/repository.js";
import CommentRepository from "./comments/repository.js";

// routes
import registerUserRoutes from "./users/routes.js";
import registerPostRoutes from "./posts/routes.js";
import registerCommentRoutes from "./comments/routes.js";

const userRepository = new UserRepository(db);
const postRepository = new PostRepository(db);
const commentRepository = new CommentRepository(db);

function registerRoutes(app) {
  registerUserRoutes(app, userRepository);
  registerPostRoutes(app, postRepository);
  registerCommentRoutes(app, commentRepository);
}

export default registerRoutes;
