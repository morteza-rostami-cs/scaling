import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import { db } from "#src/db/connection.js";

// repositories
import UserRepository from "#src/core/users/repository.js";
import PostRepository from "#src/core/posts/repository.js";
import CommentRepository from "#src/core/comments/repository.js";
import FollowRepository from "#src/core/follows/repository.js";
import LikeRepository from "#src/core/likes/repository.js";
import NotificationRepository from "#src/core/notifications/repository.js";

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

// post seeder
async function seedPosts(count) {
  const postRepository = new PostRepository(db);
  const userRepository = new UserRepository(db);

  // we need users to create rel -- user has posts
  const users = await userRepository.findAll();

  if (users.length === 0) {
    throw new Error("no users found. seed users first.");
  }

  for (let i = 0; i < count; i++) {
    // pick a random user
    const user = faker.helpers.arrayElement(users);

    const content = faker.lorem.paragraph({
      min: 1,
      max: 3,
    });

    await postRepository.createPost(user.id, content);
  }

  console.log(`💙 seeded ${count} posts. 💙`);
}

async function seedComments(count) {
  const commentRepository = new CommentRepository(db);
  const userRepository = new UserRepository(db);
  const postRepository = new PostRepository(db);

  const users = await userRepository.findAll();
  const posts = await postRepository.findAll();

  if (users.length === 0) {
    throw new Error("No users found. Seed users first.");
  }

  if (posts.length === 0) {
    throw new Error("No posts found. Seed posts first.");
  }

  for (let i = 0; i < count; i++) {
    // pick a random user and post
    const user = faker.helpers.arrayElement(users);
    const post = faker.helpers.arrayElement(posts);

    const content = faker.lorem.sentence();

    await commentRepository.createComment(post.id, user.id, content);
  }

  console.log(`🥰 Seeded ${count} comments. 🥰`);
}

async function seedFollows(count) {
  const followRepository = new FollowRepository(db);
  const userRepository = new UserRepository(db);

  const users = await userRepository.findAll();

  if (users.length < 2) {
    throw new Error("Need at least 2 users to seed follows.");
  }

  let created = 0;

  while (created < count) {
    // pick a random follower and following
    const follower = faker.helpers.arrayElement(users);
    const following = faker.helpers.arrayElement(users);

    // user can not follow her self
    if (follower.id === following.id) {
      continue;
    }

    try {
      // if follow the same user twice -- db rejects it
      await followRepository.createFollow(follower.id, following.id);

      // only if follow succeed we increment -- cause: some tries might fail -- invalid things like -- user following herself
      created++;
    } catch (error) {
      // duplicate follow
      if (error.code !== "23505") {
        throw error;
      }
    }
  }

  console.log(`🏝️ Seeded ${created} follows. 🏝️`);
}

// 🏝️

async function seedLikes(count) {
  const likeRepository = new LikeRepository(db);
  const userRepository = new UserRepository(db);
  const postRepository = new PostRepository(db);

  const users = await userRepository.findAll();
  const posts = await postRepository.findAll();

  if (users.length === 0) {
    throw new Error("No users found. Seed users first.");
  }

  if (posts.length === 0) {
    throw new Error("No posts found. Seed posts first.");
  }

  let created = 0;

  while (created < count) {
    // pick random user and post
    const user = faker.helpers.arrayElement(users);
    const post = faker.helpers.arrayElement(posts);

    try {
      // can not like same post twice
      await likeRepository.createLike(user.id, post.id);

      created++;
    } catch (error) {
      // duplicate like
      if (error.code !== "23505") {
        throw error;
      }
    }
  }

  console.log(`🏝️ Seeded ${created} likes. 🏝️`);
}

async function seedNotifications(count) {
  const notificationRepository = new NotificationRepository(db);

  const userRepository = new UserRepository(db);

  const users = await userRepository.findAll();

  if (users.length === 0) {
    throw new Error("No users found. Seed users first.");
  }

  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);

    // notification type is either: follow, like, or comment
    const type = faker.helpers.arrayElement(["follow", "like", "comment"]);

    const messages = {
      follow: "Someone started following you",
      like: "Someone liked your post",
      comment: "Someone commented on your post",
    };

    await notificationRepository.createNotification(
      user.id,
      type,
      messages[type],
    );
  }

  console.log(`🏝️ Seeded ${count} notifications. 🏝️`);
}

async function main() {
  try {
    switch (table) {
      case "users":
        await seedUsers(count);
        break;
      case "posts":
        await seedPosts(count);
        break;
      case "comments":
        await seedComments(count);
        break;

      case "follows":
        await seedFollows(count);
        break;
      case "likes":
        await seedLikes(count);
        break;
      case "notifications":
        await seedNotifications(count);
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
