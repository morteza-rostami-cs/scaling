// src/db/seed/dev.js
// npm run seed:dev
//
// Creates one login-ready user plus a web of posts, comments,
// likes, follows, and notifications so the app has real data.

import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";

import { db } from "#src/db/connection.js";
import settings from "#config/settings.js";

import UserRepository from "#src/core/users/repository.js";
import PostRepository from "#src/core/posts/repository.js";
import CommentRepository from "#src/core/comments/repository.js";
import FollowRepository from "#src/core/follows/repository.js";
import LikeRepository from "#src/core/likes/repository.js";
import NotificationRepository from "#src/core/notifications/repository.js";

// ─── config ──────────────────────────────────────────────────────────

const MAIN_EMAIL = "me@example.com";
const MAIN_USERNAME = "me";
const PASSWORD = "password123";

const OTHER_USERS = 15; // other accounts
const MAIN_POSTS = 5; // posts written by the main user
const OTHER_POSTS = 30; // posts written by others
const COMMENTS_PER_POST = 2; // on every post
const LIKES_PER_POST = 3; // on every post
const MAIN_FOLLOWS = 6; // main user follows this many others
const FOLLOWERS_OF_MAIN = 8; // others following the main user

// ─── helpers ─────────────────────────────────────────────────────────

function pick(arr) {
  return faker.helpers.arrayElement(arr);
}

function pickMany(arr, n) {
  return faker.helpers.arrayElements(arr, Math.min(n, arr.length));
}

// ─── seed ────────────────────────────────────────────────────────────

async function seed() {
  const users = new UserRepository(db);
  const posts = new PostRepository(db);
  const comments = new CommentRepository(db);
  const follows = new FollowRepository(db);
  const likes = new LikeRepository(db);
  const notifications = new NotificationRepository(db);

  const passwordHash = await bcrypt.hash(PASSWORD, settings.passwordHashLen);

  // 1. the login-ready main user
  const main = await users.createUser(MAIN_USERNAME, MAIN_EMAIL, passwordHash);
  console.log(`👑 main user: ${MAIN_EMAIL} / ${PASSWORD}`);

  // 2. other users
  const others = [];
  for (let i = 0; i < OTHER_USERS; i++) {
    const email = faker.internet.email().toLowerCase();
    const username =
      `${email.split("@")[0]}_${faker.string.alphanumeric(4)}`.replace(
        /[^a-z0-9_]/gi,
        "",
      );
    const u = await users.createUser(username, email, passwordHash);
    others.push(u);
  }
  console.log(`👥 created ${others.length} other users`);

  // 3. posts by main user + posts by others
  const mainPosts = [];
  for (let i = 0; i < MAIN_POSTS; i++) {
    const content = faker.lorem.paragraph({ min: 1, max: 3 });
    mainPosts.push(await posts.createPost(main.id, content));
  }

  const otherPosts = [];
  for (let i = 0; i < OTHER_POSTS; i++) {
    const author = pick(others);
    const content = faker.lorem.paragraph({ min: 1, max: 3 });
    otherPosts.push(await posts.createPost(author.id, content));
  }
  console.log(
    `📝 created ${mainPosts.length} main posts + ${otherPosts.length} other posts`,
  );

  // 4. comments on every post (others comment on main's posts,
  //    main comments on others' posts)
  let commentCount = 0;
  for (const post of mainPosts) {
    for (const commenter of pickMany(others, COMMENTS_PER_POST)) {
      await comments.createComment(
        post.id,
        commenter.id,
        faker.lorem.sentence(),
      );
      commentCount++;
    }
  }
  for (const post of otherPosts) {
    // main user comments on some other posts
    await comments.createComment(post.id, main.id, faker.lorem.sentence());
    commentCount++;

    for (const commenter of pickMany(others, COMMENTS_PER_POST - 1)) {
      if (commenter.id === post.user_id) continue; // don't self-comment
      await comments.createComment(
        post.id,
        commenter.id,
        faker.lorem.sentence(),
      );
      commentCount++;
    }
  }
  console.log(`💬 created ${commentCount} comments`);

  // 5. follows
  // main follows a few others
  const mainFollows = pickMany(others, MAIN_FOLLOWS);
  for (const u of mainFollows) {
    await follows.createFollow(main.id, u.id);
  }

  // others follow main
  const mainFollowers = pickMany(others, FOLLOWERS_OF_MAIN);
  for (const u of mainFollowers) {
    await follows.createFollow(u.id, main.id);
  }

  // a bit of follow graph between others too
  for (const u of others) {
    for (const target of pickMany(others, 3)) {
      if (u.id === target.id) continue;
      try {
        await follows.createFollow(u.id, target.id);
      } catch (e) {
        if (e.code !== "23505") throw e; // ignore dupes
      }
    }
  }
  console.log(
    `🔗 main follows ${mainFollows.length}, followed by ${mainFollowers.length}`,
  );

  // 6. likes
  // main likes some other posts
  for (const post of pickMany(otherPosts, 10)) {
    try {
      await likes.createLike(main.id, post.id);
    } catch (e) {
      if (e.code !== "23505") throw e;
    }
  }

  // others like main's posts
  for (const post of mainPosts) {
    for (const liker of pickMany(others, LIKES_PER_POST)) {
      try {
        await likes.createLike(liker.id, post.id);
      } catch (e) {
        if (e.code !== "23505") throw e;
      }
    }
  }

  // others like each other's posts
  for (const post of otherPosts) {
    for (const liker of pickMany(others, LIKES_PER_POST)) {
      if (liker.id === post.user_id) continue;
      try {
        await likes.createLike(liker.id, post.id);
      } catch (e) {
        if (e.code !== "23505") throw e;
      }
    }
  }
  console.log("❤️ likes created");

  // 7. notifications for the main user
  const types = ["follow", "like", "comment"];
  for (let i = 0; i < 10; i++) {
    const type = pick(types);
    const messages = {
      follow: "Someone started following you",
      like: "Someone liked your post",
      comment: "Someone commented on your post",
    };
    await notifications.createNotification(main.id, type, messages[type]);
  }
  console.log("🔔 notifications created");

  console.log("\n✅ done. log in with:");
  console.log(`   email:    ${MAIN_EMAIL}`);
  console.log(`   password: ${PASSWORD}`);
}

// ─── run ─────────────────────────────────────────────────────────────

seed()
  .catch((err) => {
    console.error("❌ seed failed:", err);
    process.exitCode = 1;
  })
  .finally(() => db.end());
