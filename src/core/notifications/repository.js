class NotificationRepository {
  constructor(db) {
    this.db = db;
  }

  // other services call this internally
  async createNotification(userId, type, message) {
    const result = await this.db.query(
      /*sql*/ `
        INSERT INTO notifications (user_id, type, message)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, type, message, is_read, created_at
      `,
      [userId, type, message],
    );

    return result.rows[0] || null;
  }

  async findByUserId(userId) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT
          id,
          user_id,
          type,
          message,
          is_read,
          created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId],
    );

    return result.rows;
  }

  async markAsRead(id, userId) {
    const result = await this.db.query(
      /*sql*/ `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
          AND user_id = $2
        RETURNING id, user_id, type, message, is_read, created_at
      `,
      [id, userId],
    );

    return result.rows[0] || null;
  }
}

export default NotificationRepository;
