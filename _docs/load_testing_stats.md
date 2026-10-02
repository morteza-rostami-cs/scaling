<!--

# things we see by running this:
k6 run load-tests/posts.js

   avg = 13.20 ms -- on average request
   med = 11.39 ms -- typical request
   max = 57.06 ms -- slowest request
   p95 = 26.09 ms -- 95% of requests made

   ┌─────────────────────────┐
   │       10 RPS TEST       │
   ├─────────────────────────┤
   │ Target RPS       10     │
   │ Actual RPS       9.9999 │
   │ Requests         600    │
   │ Successful       600    │
   │ Failed           0      │
   │ Error rate       0%     │
   └─────────────────────────┘
#=========================
# node cpu stuff:

   ## run these:
   top -p $(pgrep -n node)
   node -e "console.log(process.memoryUsage())"

   ## check these:

   rss: 40800256,
   heapTotal: 4853760,
   heapUsed: 3824816,

#=========================
# failures

HTTP errors
Connection failures
   - never reaches node api
Timeouts
PostgreSQL errors

#=========================

# check postgres
top -p $(pgrep postgres | paste -sd,)

# watch postgres pool count
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

# watch query latency

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


#=========================
#=========================
#=========================
#=========================
#=========================


-->
