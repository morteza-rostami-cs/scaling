<!--

                    ┌─────────────┐
                    │     K6      │
                    │ Load Test   │
                    └──────┬──────┘
                           │ metrics
                           ↓
┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│    Node.js   │───→│ Prometheus  │───→│   Grafana   │
│     app      │    │             │    │  Dashboard  │
└──────────────┘    └──────┬──────┘    └─────────────┘
                           ↑
┌──────────────┐           │
│ PostgreSQL   │───────────┤
└──────────────┘           │
                           │
┌──────────────┐           │
│ Node Exporter│───────────┘
│   / Server   │
└──────────────┘

#====================

# metrics coming from k6:
   - how many request it sent (rps)
   - actual rps
   - request latency -- *time per request*
      avg
      max
      med
      p95
   - errors
   - failed requests

# node js
   - cpu usage %
   - actual memory ram used
   - event loop (pool-connection)

# postgres
   - pool connections
   - queries/sec
   - query latency

# server
   - cpu %
   - ram

#========================

# node js -- is our app -- has one main thread and event loop
   ## or: our node app is out of resource

# node exporter -- gives info on linux machine running everything.

   - cpu usage
   - ram
   - disk i/o
   - network i/o

   ## entire machine is out of resource

#========================

# postgres
   - tell us about the database

   - cup usage
   - memory
   - active connections
   - queries/sec

#========================



#========================
#========================
#========================
#========================
#========================
#========================
#========================
#========================


-->
