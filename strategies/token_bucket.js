export function token_bucket(rate = 1, capacity = 5) {
    let tokens = capacity;
    let lastRefill = Date.now();

    return function() {
        const now = Date.now();
        const elapsed = (now - lastRefill) / 1000;
        tokens = Math.min(capacity, tokens + elapsed * rate);
        lastRefill = now;

        if (tokens >= 0) {
            tokens -= 1;
            return true;
        }
        return false;
    }
}