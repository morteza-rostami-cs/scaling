import { Pool } from "pg";

import settings from "#config/settings.js";

const pool = new Pool({
  host: settings.db.host,
  port: settings.db.port,
  database: settings.db.database,
  user: settings.db.user,
  password: settings.db.password,
});

console.log("new postgres pool created");

export default pool;
export { pool as db };
