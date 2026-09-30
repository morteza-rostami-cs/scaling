class LikeRepository {
  constructor(db) {
    this.db = db;
  }

  async createLike(userId, postId) {
    const result = await this.db.query(
      /*sql*/ `
        INSERT INTO likes (user_id, post_id)
        VALUES ($1, $2)
        RETURNING user_id, post_id, created_at
      `,
      [userId, postId],
    );

    return result.rows[0] || null;
  }

  async deleteLike(userId, postId) {
    const result = await this.db.query(
      /*sql*/ `
        DELETE FROM likes
        WHERE user_id = $1
          AND post_id = $2
        RETURNING user_id, post_id
      `,
      [userId, postId],
    );

    return result.rows[0] || null;
  }
}

export default LikeRepository;
