// this is a k6 script -- not a node js one.
// we run it from k6 -- k6 run my-test.js

import http from "k6/http";

export const options = {
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],

  // k6 decide the number of users -- in a way that maintains 10 rps
  scenarios: {
    // define a scenario
    baseline: {
      // so: 10 loops per second
      executor: "constant-arrival-rate",

      // 10 request
      rate: 10,
      // per sec
      timeUnit: "1s",

      // do this for 60s
      duration: "60s",

      // start with 10 users
      preAllocatedVUs: 10,
      // max users allowed
      maxVUs: 50,
    },
  },

  thrasholds: {
    // we expect http failure rate to state below 1%
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  http.get("http://localhost:3000/api/posts");
}
