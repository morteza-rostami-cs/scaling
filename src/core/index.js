import { db } from "#src/db/connection.js";

// repositories
import UserRepository from "./users/repository.js";
import registerUserRoutes from "./users/routes.js";

const userRepository = new UserRepository(db);

function registerRoutes(app) {
  registerUserRoutes(app, userRepository);
}

export default registerRoutes;
