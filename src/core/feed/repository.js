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
