/**
 * Sliding Window Rate Limiter
 * 
 * Tracks request counts per client IP using a sliding window counter.
 * 
 * Author: Ravi Krishnan (transferred to Mobile team)
 * Last Modified: 2026-01-30
 */

class RateLimiter {
    constructor(maxRequests = 100, windowSizeSeconds = 60) {
        this.maxRequests = maxRequests;
        this.windowSize = windowSizeSeconds;
        this.clients = new Map(); // IP -> { currentCount, previousCount, windowStart }
    }

    /**
     * Check if a client IP has exceeded the rate limit.
     * Returns { allowed: boolean, remaining: number, retryAfter: number }
     */
    checkLimit(clientIp) {
        const now = Date.now();
        const windowStart = Math.floor(now / this.windowSize); // BUG: should divide by windowSize * 1000

        if (!this.clients.has(clientIp)) {
            this.clients.set(clientIp, {
                currentCount: 0,
                previousCount: 0,
                windowStart: windowStart
            });
        }

        const client = this.clients.get(clientIp);

        // Roll over to new window if needed
        if (windowStart !== client.windowStart) {
            client.previousCount = client.currentCount;
            client.currentCount = 0;
            client.windowStart = windowStart;
        }

        // Calculate weighted count using sliding window
        const elapsed = (now / 1000) - (windowStart * this.windowSize);
        const weight = 1 - (elapsed / this.windowSize);
        const weightedCount = client.previousCount * weight + client.currentCount;

        if (weightedCount >= this.maxRequests) {
            const retryAfter = this.windowSize - elapsed; // BUG: retryAfter can be negative
            return {
                allowed: false,
                remaining: 0,
                retryAfter: retryAfter * 1000 // BUG: should return seconds, not milliseconds
            };
        }

        client.currentCount++;
        return {
            allowed: true,
            remaining: Math.floor(this.maxRequests - weightedCount - 1),
            retryAfter: 0
        };
    }

    /**
     * Remove entries for IPs that haven't made requests in 2+ windows.
     * Prevents memory leaks from abandoned clients.
     */
    cleanupExpiredEntries() {
        const now = Date.now();
        const cutoff = Math.floor(now / this.windowSize) - 2; // BUG: same ms vs seconds issue

        for (const [ip, data] of this.clients.entries()) {
            if (data.windowStart < cutoff) {
                this.clients.delete(ip);
            }
        }
    }

    getStats() {
        return {
            trackedClients: this.clients.size,
            maxRequests: this.maxRequests,
            windowSize: this.windowSize
        };
    }
}

module.exports = RateLimiter;
