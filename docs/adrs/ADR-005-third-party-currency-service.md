# ADR-005: Third-Party Currency Conversion Service Architecture

## Status
Accepted

## Context
Section 11 mandates: *"Each system must integrate at least one meaningful third-party API or service... Route external-service access through the ASP.NET Core backend where appropriate. Protect credentials and environment variables. Handle timeouts, invalid responses, service failures and rate limits."*
In Sri Lanka, retail merchants frequently encounter imported commodities priced in USD or EUR while operating daily transactions in Sri Lankan Rupees (LKR). We needed real-time currency conversion integrated cleanly into the platform.

## Options Considered
1. **Direct Frontend Client Calling External Currency APIs:**
   - *Pros:* Simple client-side implementation.
   - *Cons:* Violates Section 11 mandatory backend routing rule, exposes API keys, vulnerable to client CORS errors, redundant network calls across multiple client browsers.
2. **Backend Proxy with In-Memory Caching & Resilient Fallback (Selected):**
   - *Pros:* Fully satisfies architectural constraints. Uses Open Exchange Rates API (`open.er-api.com`), caches rates with a 1-hour time-to-live (`TimeSpan.FromHours(1)`), enforces strict 5-second HTTP timeouts, and falls back to deterministic local rates (`USD: 1.0`, `LKR: 305.50`, `EUR: 0.92`) if the remote provider suffers an outage.
   - *Cons:* Currency updates reflect cached hourly rates rather than tick-by-tick changes (which is acceptable and preferred for retail stability).

## Decision
We implemented `CurrencyService.cs` injected via `HttpClient` in ASP.NET Core (`ICurrencyService`), exposed via `CurrencyController.cs` (`/api/currency/convert`, `/api/currency/rates`). All external calls are brokered server-side with zero secret leaks.

## Consequences
- **Positive:** High availability even during external network failures or evaluation offline modes. Safe and fast responses for React and Flutter consumers with average latency < 10ms when cached.
- **Negative:** Cache invalidation is time-based rather than webhook-driven.
