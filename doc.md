```bash

npm init -y

# update origin
git remote set-url origin git@github.com:morteza-rostami-cs/scaling.git

# postgres

sudo systemctl status postgresql
sudo -u postgres psql
sudo -u postgres psql
\l
\q

# select db
\c scale

###

# users who are followed but also have posts
SELECT DISTINCT
  u.id        AS following_id,
  u.username  AS following_username,
  f.follower_id,
  fu.email    AS follower_email
FROM follows f
JOIN users u  ON u.id = f.following_id
JOIN users fu ON fu.id = f.follower_id
JOIN posts p  ON p.user_id = f.following_id;

###

npm install pg

# auth
npm install bcrypt cookie-parser


```
