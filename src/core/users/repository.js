// src/core/users/user.repository.js

class UserRepository {
  constructor(db) {
    this.db = db;
  }

  async createUser(username, email, passwordHash) {
    const result = await this.db.query(
      /*sql*/ `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email, created_at
      `,
      [username, email, passwordHash],
    );

    // if:undefined -- return: null -- for consistency
    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT id, username, email, password_hash, created_at
        FROM users
        WHERE id = $1
      `,
      [id],
    );
    return result.rows[0] || null;
  }

  async findByEmail(email) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT id, username, email, password_hash, created_at
        FROM users
        WHERE email = $1
      `,
      [email],
    );
    return result.rows[0] || null;
  }

  async findByUsername(username) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT id, username, email, password_hash, created_at
        FROM users
        WHERE username = $1
      `,
      [username],
    );
    return result.rows[0] || null;
  }

  async updateUser(id, username) {
    const result = await this.db.query(
      /*sql*/ `
        UPDATE users
        SET username = $1
        WHERE id = $2
        RETURNING id, username, email, created_at
      `,
      [username, id],
    );
    return result.rows[0] || null;
  }

  async deleteUser(id) {
    const result = await this.db.query(
      /*sql*/ `
        DELETE FROM users
        WHERE id = $1
        RETURNING id
      `,
      [id],
    );
    return result.rows[0] || null;
  }

  async findAll() {
    const result = await this.db.query(/*sql*/ `
        SELECT id, username, email, created_at
        FROM users
        ORDER BY id
      `);
    return result.rows;
  }
}

export default UserRepository;
