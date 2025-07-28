const { createClient } = require('redis');

const redis = createClient({ url: "redis://localhost:6379" });

let connected = false;

redis.on("error", (err) => {
    console.log('Redis connection error occured', err);
});

async function connect() {
    if (!connected) {
        await redis.connect();
        connected = true;
        console.log("Redis connected");
    }
}

connect();

function getClient() {
    if (!connected) {
        throw new Error("Redis client not connected");
    }
    return redis;
}

async function set(key, value, options = {}) {
    const args = [key, value];

    if (options.ttl) {
        args.push('EX', options.ttl);
    }

    return redis.set(...args);
}

async function get(key) {
    return redis.get(key);
}

async function clear(key) {
    return redis.del(key);
}

module.exports = {
    getClient,
    set,
    get,
    clear,
};
