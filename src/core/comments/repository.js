class CommentRepository {
  constructor(db) {
    this.db = db;
  }

  async createComment(postId, userId, content) {
    const result = await this.db.query(
      /*sql*/ `
        INSERT INTO comments (post_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, post_id, user_id, content, created_at
      `,
      [postId, userId, content],
    );

    return result.rows[0] || null;
  }

  async findByPostId(postId) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT
          c.id,
          c.post_id,
          c.user_id,
          u.username,
          c.content,
          c.created_at
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
      `,
      [postId],
    );

    return result.rows;
  }

  async findById(id) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT
          c.id,
          c.user_id,
          u.username,
          c.content,
          c.created_at
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.id = $1
      `,
      [id],
    );

    return result.rows[0] || null;
  }

  async deleteComment(id) {
    const result = await this.db.query(
      /*sql*/ `
        DELETE FROM comments
        WHERE id = $1
        RETURNING id
      `,
      [id],
    );

    return result.rows[0] || null;
  }
}

export default CommentRepository;
