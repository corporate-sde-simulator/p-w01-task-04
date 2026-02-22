/**
 * Rate Limiter Middleware for Express.js
 * 
 * Integrates the RateLimiter with Express middleware pattern
 * to protect API endpoints from abuse.
 * 
 * Author: Ravi Krishnan (transferred to Mobile team)
 * Last Modified: 2026-01-30
 */

const RateLimiter = require('./rateLimiter');

function createRateLimiterMiddleware(options = {}) {
    const limiter = new RateLimiter(
        options.maxRequests || 100,
        options.windowSeconds || 60
    );

    // Setup cleanup interval (runs every 5 minutes)
    // BUG: cleanupExpiredEntries is never actually called — setInterval is missing
    const cleanupInterval = options.cleanupIntervalMs || 300000;

    return function rateLimiterMiddleware(req, res, next) {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const result = limiter.checkLimit(clientIp);

        // Set rate limit headers on all responses
        res.set('X-RateLimit-Limit', limiter.maxRequests);
        res.set('X-RateLimit-Remaining', result.remaining);

        if (!result.allowed) {
            res.set('Retry-After', result.retryAfter); // BUG: retryAfter is in wrong unit
            return res.status(429).json({
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
                retryAfter: result.retryAfter
            });
        }

        // BUG: Missing next() call — request hangs here for allowed requests
        // next();
    };
}

module.exports = { createRateLimiterMiddleware };
