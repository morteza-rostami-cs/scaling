class PostRepository {
  constructor(db) {
    this.db = db;
  }

  async createPost(userId, content) {
    const result = await this.db.query(
      /*sql*/ `
        INSERT INTO posts (user_id, content)
        VALUES ($1, $2)
        RETURNING id, user_id, content, created_at
      `,
      [userId, content],
    );

    return result.rows[0] || null;
  }

  async findById(id) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT
          p.id,
          p.user_id,
          u.username,
          p.content,
          p.created_at
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
      `,
      [id],
    );

    return result.rows[0] || null;
  }

  async findAll() {
    const result = await this.db.query(/*sql*/ `
        SELECT
          p.id,
          p.user_id,
          u.username,
          p.content,
          p.created_at
        FROM posts p
        JOIN users u ON u.id = p.user_id
        ORDER BY p.created_at DESC
      `);

    return result.rows;
  }

  async updatePost(id, content) {
    const result = await this.db.query(
      /*sql*/ `
        UPDATE posts
        SET content = $1
        WHERE id = $2
        RETURNING id, user_id, content, created_at
      `,
      [content, id],
    );

    return result.rows[0] || null;
  }

  async deletePost(id) {
    const result = await this.db.query(
      /*sql*/ `
        DELETE FROM posts
        WHERE id = $1
        RETURNING id
      `,
      [id],
    );

    return result.rows[0] || null;
  }
}

export default PostRepository;
