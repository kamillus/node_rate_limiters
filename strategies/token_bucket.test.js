import { token_bucket } from './token_bucket';

describe('token_bucket', () => {
    test('should allow requests up to the capacity', () => {
        const bucket = token_bucket(1, 5);
        for (let i = 0; i <= 5; i++) {
            expect(bucket()).toBe(true);
        }
        expect(bucket()).toBe(false);
    });

    test('should refill tokens over time', (done) => {
        const bucket = token_bucket(1, 5);
        for (let i = 0; i <= 5; i++) {
            expect(bucket()).toBe(true);
        }
        expect(bucket()).toBe(false);

        setTimeout(() => {
            expect(bucket()).toBe(true);
            done();
        }, 1000);
    });

    test('should not exceed capacity', (done) => {
        const bucket = token_bucket(1, 3);
        for (let i = 0; i <= 3; i++) {
            expect(bucket()).toBe(true);
        }
        expect(bucket()).toBe(false);

        setTimeout(() => {
            for (let i = 0; i <= 3; i++) {
                expect(bucket()).toBe(true);
            }
            expect(bucket()).toBe(false);
            done();
        }, 4000);
    });

    test('should handle high refill rate', (done) => {
        const bucket = token_bucket(10, 5);
        for (let i = 0; i <= 5; i++) {
            expect(bucket()).toBe(true);
        }
        expect(bucket()).toBe(false);

        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                expect(bucket()).toBe(true);
            }
            expect(bucket()).toBe(false);
            done();
        }, 500);
    });
});