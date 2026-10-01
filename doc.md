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

# http status code
npm install http-status-codes

# seed script
npm run seed -- users 5

```

```bash

curl -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"password123"}' \
  http://localhost:3000/api/auth/register

curl -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"password123"}' \
  http://localhost:3000/api/auth/login

curl -b cookies.txt \
  http://localhost:3000/api/auth/me

# test concurrent like
for i in {1..10}; do
  curl -s -b cookies.txt \
    -X POST \
    http://localhost:3000/api/posts/50/like &
done

wait


# test this in postgres -- it should be only 1 row

SELECT COUNT(*)
FROM likes
WHERE user_id = 1011
  AND post_id = 50;

# concurrent comments -- should be allowed

for i in {1..10}; do
  curl -s -b cookies.txt \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"Concurrent comment $i\"}" \
    http://localhost:3000/api/posts/50/comments &
done

wait

```

```text

# can not follow the same person twice
PRIMARY KEY (follower_id, following_id),

# can not follow himself
CHECK (follower_id <> following_id)

# this prevent (race condition)
  PRIMARY KEY (user_id, post_id)

  prevents concurrent likes -- without this if they send 10 user_id, post_id -- at the same time -- we like the post 10 time -- so js test is not enough

```
