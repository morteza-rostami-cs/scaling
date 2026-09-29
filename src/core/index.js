import { db } from "#src/db/connection.js";

// repositories
import UserRepository from "./users/repository.js";
import PostRepository from "./posts/repository.js";

// routes
import registerUserRoutes from "./users/routes.js";
import registerPostRoutes from "./posts/routes.js";

const userRepository = new UserRepository(db);
const postRepository = new PostRepository(db);

function registerRoutes(app) {
  registerUserRoutes(app, userRepository);
  registerPostRoutes(app, postRepository);
}

export default registerRoutes;
