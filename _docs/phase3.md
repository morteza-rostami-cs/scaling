# starting our local pressure test:

```text

# rps
   http requests sent/completed per second

second 1 → 10 requests
second 2 → 10 requests
second 3 → 10 requests

# in 1 minutes
100 × 60 = 6,000 requests/minute

#============
# concurrency

requests arrive at the same time, and depending on response time -- they should wait.

cpu work vs i/o

## anything we await -- is i/o
   await database()
   await readFile()
   await httpRequest()

   anything that we await and move on to the next thing, we come back and get the result

## cpu work
   - we are actually looping inside our async handler, and using up cpu
   eg:
      image processing
      ai text generation
      just looping through an array and so on

      ## off load these to background jobs and so on

      ## the point is these are still blocking our request handler and increase the time for each request -- which eventually increases our -- total request per second

#===========
# throughput -- request per second or messages per second

## cases:
   - sync
   in 1 second -- we have 1000ms

   if: each request takes 100ms
   1000 / 100 = 10 -- we can do 10 rps

   - async

   in 1 second -- we have 1000ms

   each request takes -- 100ms

   if we are getting -- 10 rps

   cause: we are running thing in parallel

   in each 100ms -- we can do 10 request

      ## start at the same time
      request1 -- 100ms -- done
      request2 -- 100ms -- done

   there is 10 of 100ms in 1 second

   1000 / 100 = 10 -- 10 of 100ms in 1 sec

   so:
   10 * 10 = 100 rps (request per sec)

   10 of 100ms in 1 sec * 10 (concurrent_requests)

   - but: ultimately::
      how long each request takes -- effects how many we can handle in 1 sec.

      if: we can handle 10 rps and we are getting 20 rps
      and we keep getting them each second.
      the extra requests queue and this leads to:
         - latency and bottle neck problems
         - eventually: some might timeout and so on.

## also:
   even an await task -- can take longer and be come a bottle neck -- like postgres max_pool problem.

## also:
   - there is a difference between parallel and concurrency -- in async we park a task and await for async task to finish then we come back and get the result -- mean while we are doing other things. but every thing happens on -- one thread.
   - but: in parallel -- multiple tasks are running in different cpu threads at the same time.

#========
# latency

Latency means:

How long one request takes to receive a response.

100ms takes for 1 request

in 1 second we have 1000ms

# just a unit conversion
part/total -- 100 / 1000 = 0.1s

# so latency here is how
latency = 0.1s or (100ms) -- each one request
concurrency = x requests per second (at once)

## formula for throughput

throughput = concurrency / latency

eg: 10 rps

   ****************************

   throughput = 10 / 0.1s = 100

   ****************************

   ## of multiply by -- how many 100ms is in 1000ms
   10 * 10 = 10 / 0.1

   10 -- 1/10 -- reciprocal or 10 and 0.1

#=============

Load test
"Can the system handle this expected load?"
Stress test
"Let's keep increasing the load until the system starts breaking."

#===============

# important scaling numbers

**The 4 numbers that matter for scaling:**

1. **`http_reqs: 89.3/s`** — your actual throughput. Close to the theoretical 100/s, so your server handled the load well.

2. **`http_req_duration avg=111ms`** — real latency per request. Since your target was 100ms, the ~11ms overhead means the server is *nearly* keeping up, but not perfectly.

3. **`p(95)=207ms`** — 95% of requests finished under 207ms. This is the number users *feel*. Watch how it grows as you increase VUs.

4. **`max=425ms`** — worst case. If this balloons while avg stays flat, you have occasional contention (DB pool, GC).

**The scaling signal:** increase `vus` gradually and watch `http_req_duration`. As long as avg stays ~100ms, you have headroom. The moment p(95) or avg starts climbing, you've hit a bottleneck (likely your `pg.Pool` default of 10 connections). That's when to add pool size, caching, or more server instances.

```

```text

# event loop and async:
# why when we increase the number of request per second -- the amount of time to finish each request also increases??

## event loop:
   - it is a thread (main node js thread)
   - it has a call stack
   - it has a queue to store and process -- callbacks
   - callbacks are results of async operations
   - and event loop probably has to watch the callstack and callback queue -- once callstack is empty -- puts callback from queue in there and process is sync.

## so, when we delegate or await , async operations to other threads on cpu or other systems eg: database, network and so on -- event loop or main thread for nodeJs gets empty and can do other things -- but these tasks still need to be processed by other systems -- for example: your db has limited resources -- so: as number of requests per seconds increases -- the time to process each requests also increases -- because: other threads also have limited resources.

## also: even after other systems process async operations -- they put a callback with it's result on the queue -- and event loop has to grab and place these onto the callstack in a sync way -- the more you await for each task -- the more callbacks queue up -- and all of these need to be processed ((__synchronously__)) -- so: all this leads to more time per request -- as you increase the pressure or rsp.

```

```text

## at 10 request per seconds (10 rps)
## GET /api/posts
## we hit it for 60 sec or 1 min
===

http_req_duration -- (latency)

avg = 13.20 ms -- on average request
med = 11.39 ms -- typical request
max = 57.06 ms -- slowest request
p95 = 26.09 ms -- 95% of requests made

total = 600 requests
0 failures
9.99906 rps -- almost 10 rps

# what is average?
   Add all request times together and divide by the number of requests.

   ## average hide outliers

# med or median latency?

   sort the requests by time -- grab the middle value.

# 95% of requests -- completed in 26.09 ms or less -- only 5% took more than 26 ms

95%  <= 26.09ms
5%   >  26.09ms

# so 30 requests were slower than 26ms
# 5% = 0.05
600 * 0.05 = 30

## so, only 30 requests felt -- slower -- from a user perspective

#==============
# p(99)=35.7ms

so: only 1% of requests -- slower than 35.7ms

#==============




# errors:

HTTP errors
Connection failures
Timeouts
PostgreSQL errors

error rate = failed requests / total requests
   -- this gives us something like 2% failed

# http error:
   - any response that is not 200
   - 400 or 401 or 500
   - or unexpected http status

# connection failure:
   - for some reason k6 sends the request -- it never reaches the api/ route
   - so: no response at all

# timeout
   - k6 -> node -> postgres
   then k6 waits for a response
   - but it takes too long and k6 gives up.

#==============
# postgres errors:

k6 -> express -> repository -> postgres

# some of the common errors with postgres:

   connection pool exhausted
   connection refused
   too many connections
   query timeout
   transaction errors
   disk/resource problems

   ## we need to capture logs for node and postgres -- because: our node might return 500 for some db errors -- and that is what k6 captures -- so: we do not see the real issue.
#==============
#==============
#==============
#==============

#==============
# is node js main thread using significant CPU to handle our workload?

# does cpu usage grows until -- node becomes cpu-bound

# what is cup-bound?
   If that JavaScript work consumes most of a CPU core, eventually Node can't process requests fast enough.

#=================

# this is how cpu-bound -- can cause latency::

RPS       CPU       p95
10        5%        26ms
50        15%       30ms
100       30%       35ms
250       90%       150ms
500       100%      900ms <- cpu bottleneck -- causes: latency

#==================

# cup is not the cause of latency:

RPS       CPU       p95
10        5%        26ms
50        7%        80ms
100       8%        300ms
250       10%       2s

Now CPU is barely moving while latency is exploding.

That points us somewhere else.

Perhaps PostgreSQL, connection pooling, I/O, locks, etc.

#==================

# we also watch memory: (cpu memory)
   - rss

   1 MB = 1,024 KB (in binary, using the 1024-based system).

   RES is in kilobytes — so 76520 KB ≈ 74.7 MB of actual RAM that process is using right now.

   ## actual ram memory that this cpu process is using. live inside of ram.

      RSS
   ├── V8 heap
   ├── Node internals
   ├── native memory
   ├── loaded libraries
   └── other process memory

   - heap

      stores js objects.

      if this goes up -- we might have memory leak.

# get node js memory -- in bytes
node -e "console.log(process.memoryUsage())"

{
  rss: 40820736,
  heapTotal: 4853760,
  heapUsed: 3824816,
  external: 1429362,
  arrayBuffers: 22799
}

Field	     Bytes	     MB
rss	40,820,736	      38.93 MB
heapTotal	4,853,760	4.63 MB
heapUsed	3,824,816	   3.65 MB
external	1,429,362	   1.36 MB
arrayBuffers	22,799	0.02 MB

#==================

# keep track of memory usage:

RPS       RSS       heapUsed
────────────────────────────
10        120 MB    15 MB
50        125 MB    16 MB
100       128 MB    17 MB
250       130 MB    18 MB
500       135 MB    20 MB


#==================

10 RPS baseline

Node memory
────────────────────
RSS before:
RSS during:
RSS after:

heapUsed before:
heapUsed during:
heapUsed after:


#==================

ostgres=# SELECT
  state,
  count(*)
FROM pg_stat_activity
GROUP BY state;
 state  | count
--------+-------
        |     5
 active |     1
 idle   |     1
(3 rows)




#==================

# some situations that postgres is the problem

HTTP p95:             300ms
PostgreSQL query:     250ms

or

PostgreSQL CPU: 95%
query latency: 250ms
HTTP p95:      300ms

#==================

CPU
+
memory
+
connections (node pool)
+
query activity
+
query latency

#==================

10 RPS baseline
────────────────────────────

Node
CPU:              ?
RSS:              ?

PostgreSQL
CPU:              ?
Memory:           ?
Connections:      ?
Query latency:    ?

#==================
#==================
#==================
#==================

```

<!--

# explain why latency or amount of time for request per second increases -- as the request per second increases

# so: there is this queue problem.

# think in a bank
   - the time ro process task on the counter for each customer can be the same. eg: 1min for each customer -- meaning the bank guy process shit in 1 min
   - but as the line grows -- the time to process for each customer in line also increases.

   so: if your the 10th guy in line
   time to process = actual time to process on counter + 9 people in front of you
   so: time keeps adding up as queue grows and the next task has to wait longer.

   the same thing true for async tasks:
      - even if inside of you http handler you are doing some stuff that takes 100ms -- as the queue grows this time adds up.
      - and even though we do tasks async -- our resources are still limited outside of event loop and event loop has to still process the callbacks from the queue

-->

```js

```
