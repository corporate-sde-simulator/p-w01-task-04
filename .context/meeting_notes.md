# Meeting Notes — Sprint 23 Planning

**Date:** Feb 10, 2026  
**Attendees:** Kavitha (API Lead), Ravi, Deepak, Intern

---

## API Rate Limiting

- **Kavitha:** We've been seeing abuse on the public endpoints — one client is sending 5,000 req/min. We need rate limiting ASAP. Ravi started this but is moving to mobile. @Intern, pick up PLATFORM-2835.

- **Deepak:** I reviewed Ravi's code. The sliding window math looks off — he's checking the wrong timestamp boundary. Also the middleware function doesn't call `next()` correctly.

- **Kavitha:** We need this by end of sprint. Just focus on per-IP limiting for now. We can add API-key-based limiting in Sprint 24.

## Action Items

- [ ] @Intern — Fix rate limiter middleware (PLATFORM-2835)
- [ ] @Deepak — Review PR when ready
- [ ] @Kavitha — Coordinate with DevOps to deploy behind the load balancer
