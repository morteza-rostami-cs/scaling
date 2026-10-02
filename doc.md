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

# install k6 -- for load testing

sudo gpg -k

curl -fsSL https://dl.k6.io/key.gpg \
  | sudo gpg --dearmor \
  -o /usr/share/keyrings/k6-archive-keyring.gpg

echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list

sudo apt-get update

sudo apt-get install k6

k6 version

# run load test script
k6 run load-tests/posts.js

#========================
#========================
# see cpu processes

top
# sort by usage
shift + p

# or
htop
# then search for node -- f4

# search by port
sudo lsof -i :3000

# see the node js process
Press F4 (Filter) and type server.js

# print cpu usage
top -b -n 1 > top.txt

# watch for this
300155   apax   0.0   1.1   node-Ma+          ← ⭐ YOUR ACTUAL SERVER

## this command only shows node process
top -p $(pgrep -n node)

## see node memory info
node -e "console.log(process.memoryUsage())"

# postgres process and memory

## newest process
top -p $(pgrep -n postgres)

## all process
## run this -- while k6 is hammering -- to see the postgres process
top -p $(pgrep postgres | paste -sd,)

# check postgres connection pool count
# during k6 running -- on more pool is created
SELECT count(*) FROM pg_stat_activity;

# get more info on connections
SELECT
  state,
  count(*)
FROM pg_stat_activity
GROUP BY state;

# create a postgres role
sudo -u postgres psql -c "CREATE ROLE apax LOGIN SUPERUSER;"

# now we can watch db stuff
watch -n 1 'psql "postgresql://postgres:love@localhost:5432/scale" -c "SELECT count(*) FROM pg_stat_activity;"'

# watch query activity

watch -n 1 'psql "postgresql://postgres:love@localhost:5432/scale" -c "
SELECT
  pid,
  state,
  wait_event_type,
  wait_event,
  left(query, 60) AS query
FROM pg_stat_activity
WHERE datname = '\''scale'\''
ORDER BY state, pid;
"'

# watch query latency (extension must be activated first)
# pg_stat_statements

watch -n 2 'psql "postgresql://postgres:love@localhost:5432/scale" -c "
SELECT
  calls,
  round(mean_exec_time::numeric, 2)  AS avg_ms,
  round(max_exec_time::numeric, 2)   AS max_ms,
  rows,
  left(query, 70) AS query
FROM pg_stat_statements
WHERE query NOT ILIKE '\''%pg_stat_statements%'\''
ORDER BY mean_exec_time DESC
LIMIT 15;
"'

## installing the extension

# create extension for my specific db
psql "postgresql://postgres:love@localhost:5432/scale" \
  -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

# check for extension in scale
psql "postgresql://postgres:love@localhost:5432/scale" \
  -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

# check
psql "postgresql://postgres:love@localhost:5432/scale" \
  -c "\dx pg_stat_statements"

# check preload
psql "postgresql://postgres:love@localhost:5432/scale" \
  -c "SHOW shared_preload_libraries;"

##

# You need to see:

pg_stat_statements

# If you see an empty value, your postgresql.conf change isn't active.

# Don't use /etc/postgresql/*/main/postgresql.conf literally.

# Find the actual configuration file:

psql "postgresql://postgres:love@localhost:5432/scale" \
  -c "SHOW config_file;"

# You'll get something like:

# /etc/postgresql/16/main/postgresql.conf

# Edit that exact file:

sudo nano /etc/postgresql/16/main/postgresql.conf

# and make sure you have:

# shared_preload_libraries = 'pg_stat_statements'

## finally reset postgres
sudo systemctl restart postgresql

# verify
psql "postgresql://postgres:love@localhost:5432/scale" \
  -c "SHOW shared_preload_libraries;"

psql "postgresql://postgres:love@localhost:5432/scale" \
  -c "SELECT count(*) FROM pg_stat_statements;"



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
