# PLATFORM-2835: Implement REST API rate limiter middleware

**Status:** In Progress Â· **Priority:** High
**Sprint:** Sprint 23 Â· **Story Points:** 5
**Reporter:** Kavitha Rajan (API Gateway Lead) Â· **Assignee:** You (Intern)
**Created:** Â· **Due:** End of sprint (Friday)
**Labels:** `backend`, `api-gateway`, `nodejs`, `middleware`
**Epic:** PLATFORM-2810 (API Gateway Hardening)
**Task Type:** Bug Fix

---

## Description

Our public API is getting hammered by some clients sending thousands of requests per minute. We need a rate limiter middleware that uses the sliding window algorithm to throttle requests per client IP.

Ravi (mid-level dev) started the implementation but got reassigned to the mobile team. His code uses a token bucket approach but has several bugs â€” the token refill logic is wrong and the middleware doesn't properly pass control to the next handler when the request is allowed.

## Requirements

- Rate limit: 100 requests per 60-second window per IP
- Use sliding window counter algorithm
- Return `429 Too Many Requests` with `Retry-After` header when limit exceeded
- Allow requests through when under the limit
- Clean up expired window entries to prevent memory leaks
- Thread-safe (handle concurrent requests)

## Acceptance Criteria

- [ ] Requests under the limit pass through successfully
- [ ] Requests over the limit get 429 response
- [ ] `Retry-After` header contains correct remaining seconds
- [ ] Expired entries are cleaned up periodically
- [ ] Different IPs have independent rate limits
- [ ] All unit tests pass

## Design Notes

See `docs/DESIGN.md` for the sliding window vs token bucket decision.
See `.context/pr_comments.md` for Ravi's PR feedback.
