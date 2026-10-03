import client from "prom-client";

// expose node process -- metrics
client.collectDefaultMetrics();

export const register = client.register;
