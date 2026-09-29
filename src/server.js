import app from "./app.js";
// import settings from "./config/settings.js";
import http from "node:http";

import settings from "#config/settings.js";
import pool, { db } from "./db/connection.js";

console.log(settings);

const server = http.createServer(app);

// error handler
server.on("error", (err) => {
  console.error("server error", err);
});

async function start() {
  //   const result = await db.query(/*sql*/ `select 1 as result`);

  try {
    // get the current db and postgres user
    const result = await db.query(/*sql*/ `
      SELECT
         current_database() as database,
         current_user as user
      `);
    console.log("\n🎉 postgres connected 🎉\n");
    console.log(result.rows);
  } catch (error) {
    console.error(`\n💥 postgres connection failed 💥\n`, error);
    process.exit(1);
  }
}

await start();

// run server
server.listen(settings.port, () => {
  console.log(`server running on ${settings.port}`);
});

function shutdown() {
  server.close(() => {
    console.log("server closed");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
