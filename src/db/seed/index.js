import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import { db } from "#src/db/connection.js";
import UserRepository from "#src/core/users/repository.js";
import settings from "#config/settings.js";

console.log(settings);

// get command line args for eg: table, count

// npm run seed -- users 100
const table = process.argv[2];
const count = Number(process.argv[3]);

if (!table || !count) {
  console.log("usage: npm run seed -- <table> <count>");
  process.exit(1);
}

// user seeder
async function seedUsers(count) {
  const repository = new UserRepository(db);

  // all accounts use the same password
  const passwordHash = await bcrypt.hash(
    "password123",
    settings.passwordHashLen,
  );

  for (let i = 0; i < count; i++) {
    const email = faker.internet.email().toLowerCase();

    const username =
      `${email.split("@")[0]}_${faker.string.alphanumeric(4)}`.replace(
        /[^a-z0-9_]/gi,
        "",
      );

    await repository.createUser(username, email, passwordHash);
  }

  console.log(`❤️ seeded ${count} users. ❤️`);
}

async function main() {
  try {
    switch (table) {
      case "users":
        await seedUsers(count);
        break;

      default:
        console.log(`unknown seed table ${table}`);
        process.exitCode = 1;
        break;
    }
  } catch (error) {
    console.error("seeding failed", error);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

main();
