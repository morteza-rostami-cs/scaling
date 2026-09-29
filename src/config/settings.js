class Settings {
  constructor(env) {
    if (!env) throw new Error("env missing");
    if (!env?.NODE_ENV) throw new Error("NODE_ENV missing");
    if (env.PORT === null) throw new Error("PORT missing");
    if (!env.DATABASE_URL) throw new Error("DATABASE_URL missing");

    this.nodeEnv = env.NODE_ENV;
    this.port = Number(env.PORT);
    this.dbUrl = env.DATABASE_URL;

    this.db = {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    };
  }
}

const settings = new Settings(process.env);
export default settings;
