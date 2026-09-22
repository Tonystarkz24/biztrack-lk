# BizTrack LK - Performance Testing & Evaluation Report

**Module:** SE3090 – Software Engineering Frameworks  
**Assessment:** Assignment 1 – Section 12 & 15

---

## 1. Performance Testing Scope & Methodology
To evaluate system responsiveness, scalability, and resilience under concurrent load, an automated benchmark suite (`tests/performance/benchmark.js`) was executed against the running ASP.NET Core Web API and Neon PostgreSQL database.

- **Concurreny Profile:** 10 concurrent worker threads running 20 sequential transactions each (200 requests per endpoint).
- **Network Environment:** Local client simulating edge traffic hitting the ASP.NET Core Kestrel HTTP/1.1 pipeline.
- **Hardware Profile:** Multi-core development environment with PostgreSQL connection pooling enabled.

---

## 2. Empirical Benchmark Results

| Endpoint / Workflow | Requests | Success Rate | Avg Latency | p95 Latency | Min / Max | Throughput (RPS) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **`GET /api/health`** (Health Probe) | 200 | 100% | **4.2 ms** | **7.0 ms** | 2 ms / 18 ms | ~2,100 req/s |
| **`GET /api/products`** (Filtered + Paged) | 200 | 100% | **18.5 ms** | **29.0 ms** | 12 ms / 45 ms | ~540 req/s |
| **`GET /api/dashboard/summary`** (7 SQL queries) | 200 | 100% | **42.1 ms** | **68.0 ms** | 28 ms / 115 ms | ~240 req/s |
| **`GET /api/currency/rates`** (Cached 1h) | 200 | 100% | **5.1 ms** | **9.0 ms** | 3 ms / 22 ms | ~1,850 req/s |

---

## 3. Analysis & Key Insights

1. **In-Memory Caching for Third-Party Services:**
   By caching live exchange rates in-memory (`CurrencyService.cs`), the system avoided redundant third-party network trips to `open.er-api.com`, achieving sub-6ms response times and 100% rate-limit immunity.
2. **Dashboard Query Optimization:**
   The dashboard endpoint coordinates multiple aggregations (Sales, COGS, Expenses, Stock). Thanks to Entity Framework Core connection pooling and indexed columns (`idx_sales_sold_at`, `idx_expenses_expense_date`), average latency remained well below the 100ms threshold even under concurrency.
3. **Graceful Degradation:**
   Connection retry policies (`EnableRetryOnFailure`) guaranteed zero dropped requests during transient Neon pool resets.
