# ADR-009: Rate Limiting Strategy â€” Sliding Window vs Token Bucket

**Date:**  
**Status:** Accepted  
**Authors:** Kavitha Rajan, Ravi Krishnan

## Decision

We will use a **sliding window counter** algorithm for API rate limiting instead of a fixed window or token bucket.

## Context

The API gateway handles ~50K requests/minute. We need per-client rate limiting that is accurate and memory-efficient. The rate limit is 100 requests per 60-second window per IP address.

## Options Considered

| Algorithm | Accuracy | Memory | Complexity | Burst Handling |
|---|---|---|---|---|
| Fixed Window | Low (boundary burst) | Low | Simple | Poor |
| Sliding Window Log | High | High (stores every timestamp) | Medium | Good |
| Sliding Window Counter | Good | Low (2 counters per window) | Medium | Good |
| Token Bucket | Good | Low | Medium | Configurable |

## Rationale

- Sliding window counter avoids the boundary burst problem of fixed windows
- Lower memory than sliding window log (doesn't store individual timestamps)
- Provides a good balance of accuracy and performance
- Simpler to implement in a single-node setup

## Consequences

- Not perfectly accurate (uses weighted average of current + previous window)
- Multi-node deployments will need Redis-backed counters (future work)
- Need periodic cleanup of expired window data to prevent memory growth
