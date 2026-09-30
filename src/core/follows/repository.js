class FollowRepository {
  constructor(db) {
    this.db = db;
  }

  async createFollow(followerId, followingId) {
    const result = await this.db.query(
      /*sql*/ `
        INSERT INTO follows (follower_id, following_id)
        VALUES ($1, $2)
        RETURNING follower_id, following_id, created_at
      `,
      [followerId, followingId],
    );

    return result.rows[0] || null;
  }

  async deleteFollow(followerId, followingId) {
    const result = await this.db.query(
      /*sql*/ `
        DELETE FROM follows
        WHERE follower_id = $1
          AND following_id = $2
        RETURNING follower_id, following_id
      `,
      [followerId, followingId],
    );

    return result.rows[0] || null;
  }

  async findFollowers(userId) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT
          u.id,
          u.username,
          u.email
        FROM follows f
        JOIN users u ON u.id = f.follower_id
        WHERE f.following_id = $1
        ORDER BY f.created_at DESC
      `,
      [userId],
    );

    return result.rows;
  }

  async findFollowing(userId) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT
          u.id,
          u.username,
          u.email
        FROM follows f
        JOIN users u ON u.id = f.following_id
        WHERE f.follower_id = $1
        ORDER BY f.created_at DESC
      `,
      [userId],
    );

    return result.rows;
  }
}

export default FollowRepository;
