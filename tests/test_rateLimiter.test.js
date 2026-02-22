/**
 * Tests for Rate Limiter and Middleware
 */

const RateLimiter = require('../src/rateLimiter');
const { createRateLimiterMiddleware } = require('../src/rateLimiterMiddleware');

describe('RateLimiter', () => {
    let limiter;

    beforeEach(() => {
        limiter = new RateLimiter(5, 60); // 5 requests per 60 seconds for testing
    });

    test('should allow requests under the limit', () => {
        const result = limiter.checkLimit('192.168.1.1');
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(4);
    });

    test('should block requests over the limit', () => {
        for (let i = 0; i < 5; i++) {
            limiter.checkLimit('192.168.1.1');
        }
        const result = limiter.checkLimit('192.168.1.1');
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
    });

    test('should track different IPs independently', () => {
        for (let i = 0; i < 5; i++) {
            limiter.checkLimit('192.168.1.1');
        }
        const result = limiter.checkLimit('192.168.1.2');
        expect(result.allowed).toBe(true);
    });

    test('should return correct retryAfter when blocked', () => {
        for (let i = 0; i < 5; i++) {
            limiter.checkLimit('192.168.1.1');
        }
        const result = limiter.checkLimit('192.168.1.1');
        expect(result.retryAfter).toBeGreaterThan(0);
    });

    test('should provide stats', () => {
        limiter.checkLimit('192.168.1.1');
        limiter.checkLimit('192.168.1.2');
        const stats = limiter.getStats();
        expect(stats.trackedClients).toBe(2);
        expect(stats.maxRequests).toBe(5);
    });

    test('should cleanup expired entries', () => {
        limiter.checkLimit('192.168.1.1');
        expect(limiter.getStats().trackedClients).toBe(1);
        limiter.cleanupExpiredEntries();
        // Entry is still current, so it should not be cleaned
        expect(limiter.getStats().trackedClients).toBe(1);
    });
});

describe('RateLimiterMiddleware', () => {
    let middleware;
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        middleware = createRateLimiterMiddleware({ maxRequests: 3, windowSeconds: 60 });
        mockReq = { ip: '10.0.0.1' };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            set: jest.fn()
        };
        mockNext = jest.fn();
    });

    test('should call next() for allowed requests', () => {
        middleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });

    test('should return 429 when rate limit exceeded', () => {
        for (let i = 0; i < 3; i++) {
            middleware(mockReq, mockRes, mockNext);
        }
        mockNext.mockClear();
        middleware(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(429);
        expect(mockNext).not.toHaveBeenCalled();
    });

    test('should set rate limit headers', () => {
        middleware(mockReq, mockRes, mockNext);
        expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Limit', 3);
        expect(mockRes.set).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(Number));
    });

    test('should set Retry-After header when blocked', () => {
        for (let i = 0; i < 3; i++) {
            middleware(mockReq, mockRes, mockNext);
        }
        middleware(mockReq, mockRes, mockNext);
        expect(mockRes.set).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    });
});
