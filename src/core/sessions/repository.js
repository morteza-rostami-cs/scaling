import crypto from "crypto";

class SessionRepository {
  constructor(db) {
    this.db = db;
  }

  async create(userId) {
    // generate a session token
    const token = crypto.randomBytes(32).toString("hex");

    const result = await this.db.query(
      /*sql*/ `
        INSERT INTO sessions (user_id, token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '7 days')
        RETURNING id, user_id, token, expires_at
      `,
      [userId, token],
    );

    return result.rows[0] || null;
  }

  async findByToken(token) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT
          s.id,
          s.user_id,
          s.token,
          s.expires_at
        FROM sessions s
        WHERE s.token = $1
          AND s.expires_at > NOW()
      `,
      [token],
    );

    return result.rows[0] || null;
  }

  async deleteByToken(token) {
    await this.db.query(
      /*sql*/ `
        DELETE FROM sessions
        WHERE token = $1
      `,
      [token],
    );
  }
}

export default SessionRepository;
