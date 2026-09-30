class FeedRepository {
  constructor(db) {
    this.db = db;
  }

  async findFeed(userId) {
    const result = await this.db.query(
      /*sql*/ `
        SELECT
          p.id,
          p.user_id,
          u.username,
          p.content,
          p.created_at
        FROM posts p
        JOIN users u
          ON u.id = p.user_id
        JOIN follows f
          ON f.following_id = p.user_id
        WHERE f.follower_id = $1
        ORDER BY p.created_at DESC
      `,
      [userId],
    );

    return result.rows;
  }

  async rebuildFeed(userId) {
    const result = await this.db.query(/*sql*/ `
      SELECT
        p.id,
        p.user_id,
        u.username,
        p.content,
        p.created_at
      FROM posts p
      JOIN users u
        ON u.id = p.user_id
      ORDER BY p.created_at DESC
    `);

    const posts = result.rows;

    const feed = [];

    for (const post of posts) {
      // check if any follow with: current_user.id == follower and post.user_id == following
      // basically: if any author is followed by current_user?
      const follows = await this.db.query(
        /*sql*/ `
        SELECT 1
        FROM follows
        WHERE follower_id = $1
          AND following_id = $2
      `,
        [userId, post.user_id],
      );

      // if zero post.author is a following for current_user -- skip
      if (follows.rows.length === 0) {
        continue;
      }

      // count comments
      const comments = await this.db.query(
        /*sql*/ `
        SELECT COUNT(*)::int AS count
        FROM comments
        WHERE post_id = $1
      `,
        [post.id],
      );

      // count likes
      const likes = await this.db.query(
        /*sql*/ `
        SELECT COUNT(*)::int AS count
        FROM likes
        WHERE post_id = $1
      `,
        [post.id],
      );

      feed.push({
        ...post,
        comments: comments.rows[0].count,
        likes: likes.rows[0].count,
      });
    }

    feed.sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return feed;
  }
}

export default FeedRepository;

/*

posts
with users -- get all users with post.user_id


JOIN follows f
   # followings who are post author
   ON f.following_id = p.user_id
   # followed by current user
   WHERE f.follower_id = $1
   
with follows
   - get the follows , where following an post.author (so they have a post)
   - and where i am the follower

   cause: we don't want followers with no posts

# basically:
   following has to be a post author
   and
   follower must be current user

*/
