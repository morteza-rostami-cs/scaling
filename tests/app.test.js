import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import app from "../src/app.js";

let server; // http server for test
let baseUrl; // http api url

// runs before execute a suit of test
before(() => {
  server = http.createServer(app);

  // run server:: on any available port
  server.listen(0);

  // get whatever port was free and set
  const { port } = server.address();

  // base url we use for testing api routes
  baseUrl = `http://localhost:${port}`;
});

// run after suits of test
after(() => {
  server.close();
});

// integration/API tests*********************

// test server health
test("GET /api/health returns 200", async () => {
  // test name
  const response = await fetch(`${baseUrl}/api/health`);

  // status = 200
  assert.equal(response.status, 200);

  // get the json data
  const body = await response.json();

  // deep equality -- also check for nested objects and so on
  assert.deepEqual(
    body, // actual value we test
    // expected value
    {
      status: "ok",
    },
  );
});

// test requireAuth
test("GET /api/feed requires authentication", async () => {
  const response = await fetch(`${baseUrl}/api/feed`);

  assert.equal(response.status, 401);

  const body = await response.json();

  assert.equal(body.error, "authenticated required");
});

// missing request fields
test("POST /api/auth/register rejects missing email", async () => {
  // name
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      password: "password123",
      // missing email
    }),
  });

  // bad_request
  assert.equal(response.status, 400);

  const body = await response.json();

  assert.equal(body.error, "missing email or password");
});

// invalid url param -- postgres 22P02 error
test("GET /api/users/:id rejects invalid ID", async () => {
  // name
  const response = await fetch(`${baseUrl}/api/users/ass`);

  assert.equal(response.status, 400);

  const body = await response.json();

  assert.equal(body.error, "Invalid input");
});

// none existent resource
test("GET /api/users/:id returns 404 for missing user", async () => {
  const response = await fetch(`${baseUrl}/api/users/999999999`);

  assert.equal(response.status, 404);

  const body = await response.json();

  assert.equal(body.error, "User not found");
});
