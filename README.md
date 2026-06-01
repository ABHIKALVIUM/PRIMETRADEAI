# Secure, Highly Scalable, Production-Ready Monorepo

Welcome to the **Monorepo Task REST Engine**! This project is a production-grade implementation of a clean, decoupled full-stack architecture. It is designed as a modular monorepo separated completely into a standalone API `/backend` and a highly reactive client desk `/frontend`.

DEPLOY LINK: https://primetradeai-6vbl.vercel.app/

---

## 1. Directory Structure

```text
/root
  ├── /backend
  │    ├── /config          # db.js, redis.js (Database & Caching connectors)
  │    ├── /controllers     # authController.js, taskController.js (CRUD controllers)
  │    ├── /models          # User.js, Task.js (Mongoose models & mock-failover proxies)
  │    ├── /routes          # v1/authRoutes.js, v1/taskRoutes.js (API versioning Router)
  │    ├── /middlewares     # Auth protection, RBAC gates, error/validate flows
  │    ├── /utils           # Custom ApiError class, pure input regex validators
  │    ├── package.json
  │    ├── Dockerfile
  │    └── server.js        # Standalone API entrypoint (PORT: 5000)
  │
  ├── /frontend
  │    ├── /src
  │    │    ├── /components # Login, Register, TaskForm, TaskList components
  │    │    ├── /context    # AuthContext (JWT memory state & storage binders)
  │    │    ├── App.js      # Layout orchestrator and Toast handlers
  │    │    └── index.js    # React root index
  │    ├── package.json
  │    └── tailwind.config.js
  │
  ├── docker-compose.yml    # Full-stack network orchestration (Mergong API + Mongo + Redis)
  └── README.md
```

---

## 2. Quickstart Execution Guide

To run this application locally, you can choose between native concurrent operations or Docker Compose orchestration.

### A. Run via Docker Compose (Recommended)
This boots up the complete isolated network including **Express API Server, MongoDB database, and Redis high-speed cache** instantly.
```bash
# From the project root
docker-compose up --build
```
- **API URL:** `http://localhost:5000`
- **MongoDB Database:** `mongodb://localhost:27017`
- **Redis Cache:** `redis://localhost:6379`

### B. Run Native Concurrently (Local Node Environment)
You can launch both directories concurrently in development mode.

#### 1. Setup Backend
```bash
cd backend
npm install
# Set custom environments (or leverage sandbox fallbacks)
export MONGO_URI="mongodb://localhost:27017/monorepo_db"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="your_secure_development_secret_keys"
npm run start
```

#### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

## 3. Scalability, Security & Production Readiness Note

### A. High-Performance Redis Caching Strategies
In our implementation inside `/backend/controllers/taskController.js`, we demonstrate **Write-Through / Cache-Aside hybrid patterns**:
1. **Cache Reads:** On fetching tasks (`GET /api/v1/tasks`), the system computes a deterministic `cacheKey` based on the calling user's UUID, their RBAC role, and search filters (such as `status`, `priority`, or `page`).
2. **Cache Checks:** If a `cacheKey` exists in memory or Redis client, we perform a **Cache Hit** returning compiled JSON immediately, escaping expensive MongoDB indexes search operations.
3. **Cache Mutations & Invalidation:** On insertions (`POST`), updates (`PUT`), or deletions (`DELETE`), we automatically perform **Cache Invalidation** (`redisClient.clear()` or target eviction), avoiding dirty stale data reads.

### B. Decoupled Monolithic Architecture to Microservices Migration Pathway
The `/backend` codebase is designed following a **Domain-Driven Modular Monolith (DDMM)** layout, which makes scaling horizontal domains very straightforward:
- **Separation Points:** The `/models`, `/controllers`, and `/routes` are partitioned exclusively into `Auth` (User domain) and `Tasks` domains.
- **Migration Plan:** 
  1. Set up an API Gateway (such as Kong, Traefik, or Nginx) to route traffic from outer ingress down to `/api/v1/users/*` and `/api/v1/tasks/*`.
  2. Extract `/backend/controllers/authController.js` and `/models/User.js` into an independent **Identity Service** communicating with its own RDS/MongoDB instance.
  3. Extract `/backend/controllers/taskController.js` and `/models/Task.js` into an independent **Task Execution Service**.
  4. Implement lightweight RPC / PubSub events (using message brokers like RabbitMQ, Apache Kafka, or Redis Streams) to coordinate between the task service and identity validation when user profiles mutate.

### C. Large-Scale Database Indexing Layout
To handle millions of queries without degradation:
1. **Compounded Indexes:** For the Task collection, query patterns frequently fetch tasks looking at status filters or priority. We declare compounded, sparse indices on `{ createdBy: 1, status: 1 }` and `{ createdBy: 1, priority: 1, createdAt: -1 }`.
2. **Deterministic Uniqueness:** The email index is configured with `{ email: 1 }` with a `unique: true` property. It's case-insensitive of input collation, lowering collision margins.
3. **TTL Indices:** For background cache records, we leverage MongoDB's Time-To-Live indexes to auto-purge logs and records after expiration boundaries.

### D. Server Security Hardening Checklists
For secure Internet ingress routing:
- **Rate-Limiting:** Incorporate `express-rate-limit` to prevent brute force attacks. We bound login requests to a maximum of 10 requests per minute from a single IP frame.
- **HTTP Header Hardening:** Mount `helmet()` middleware early in the Express pile to append strict security headers (e.g. Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options to counteract clickjacking, and X-Content-Type-Options).
- **Secure CORS Scopes:** Clean cross-domain requests. Lock CORS policies to explicit whitelist parameters (such as `process.env.ALLOWED_ORIGINS`).
- **Input Sanitization:** Sanitize input bodies against SQL injection or XSS payloads using standard DOM purifiers and query filters.
