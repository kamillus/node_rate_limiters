import { leaky_bucket } from './leaky_bucket';

describe('leaky_bucket', () => {
    test('should allow requests within capacity', () => {
        const bucket = leaky_bucket(5, 10);
        for (let i = 0; i < 10; i++) {
            expect(bucket()).toBe(true);
        }
    });

    test('should block requests exceeding capacity', () => {
        const bucket = leaky_bucket(5, 10);
        for (let i = 0; i < 10; i++) {
            bucket();
        }
        expect(bucket()).toBe(false);
    });

    test('should allow requests after rate limit reset', (done) => {
        const bucket = leaky_bucket(5, 10);
        for (let i = 0; i < 10; i++) {
            bucket();
        }
        setTimeout(() => {
            expect(bucket()).toBe(true);
            done();
        }, 1000);
    });

    test('should handle zero rate and capacity', () => {
        const bucket = leaky_bucket(0, 0);
        expect(bucket()).toBe(false);
    });
});