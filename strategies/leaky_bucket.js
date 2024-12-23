export function leaky_bucket(rate = 5, capacity = 10) {
    let current = 0;
    let lastTime = Date.now();

    return function () {
        const now = Date.now();
        const elapsed = now - lastTime;
        lastTime = now;

        current = Math.max(0, current - (elapsed * rate / 1000));

        if (current < capacity) {
            current++;
            return true;
        }

        return false;
    };
}