import { db } from "./connection.js";

const usersSchema = /*sql*/ `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`;

async function main() {
  try {
    // run users schema
    await db.query(usersSchema);

    console.log("users schema created successfully.");
  } catch (error) {
    console.error("Failed to create database schema:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
