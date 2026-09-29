
class Settings {
   constructor(env) {

      if (!env) throw new Error("env missing")
      if (!env?.NODE_ENV) throw new Error("NODE_ENV missing")
      if (!env.PORT) throw new Error("PORT missing")

      this.nodeEnv = env.NODE_ENV
      this.port = env.PORT
   }
}

const settings = new Settings(process.env)
export default settings