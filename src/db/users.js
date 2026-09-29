import { db } from "./connection.js";

async function insert(username, email, password) {
  const insertResult = await db.query(
    /*sql*/ `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
   `,
    [username, email, password],
  );

  console.log("INSERT:");
  console.log(insertResult.rows);
}

async function main() {
  try {
    insert("ali", "ali@gmail.com", "1234");
    insert("mina", "mina@gmail.com", "1234");
  } catch (error) {
    console.error("db operation failed: ", error);
  } finally {
    await db.end();
  }
}

main();
