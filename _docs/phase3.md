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

```

```js

```
