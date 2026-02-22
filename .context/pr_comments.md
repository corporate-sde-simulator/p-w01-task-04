# PR #358 Review — Rate Limiter Middleware (by Ravi Krishnan)

## Reviewer: Kavitha Rajan (API Gateway Lead) — Jan 28, 2026

---

**Overall:** Needs work. The architecture is sound but the window calculation has bugs.

### `rateLimiter.js`

> **Line 24** — `isRateLimited` method:  
> You're comparing `Date.now()` with seconds instead of milliseconds. The window boundary calc is off by a factor of 1000.

> **Line 35** — `cleanupExpiredEntries`:  
> This never gets called. You declare it but don't hook it up to the interval timer.

> **Line 48** — Response headers:  
> The `Retry-After` header should be in seconds, but you're sending milliseconds.

### `rateLimiterMiddleware.js`

> **Line 15** — Missing `next()` call:  
> When the request is within the limit, you're not calling `next()` — so even allowed requests get stuck. This is a critical bug.

> **Line 22** — Error response:  
> Good — the 429 status with JSON body is correct. Just fix the `Retry-After` value.

---

**Ravi Krishnan** — Jan 30, 2026

> Apologies, I rushed this before my transfer. The next() issue is a definite miss. Handing off to whoever takes this next.
