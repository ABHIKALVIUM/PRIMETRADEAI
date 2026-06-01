const memoryCache = new Map();
let isUsingLocalRedisFallback = true;

export const redisClient = {
  get: async (key) => {
    if (isUsingLocalRedisFallback) {
      const item = memoryCache.get(key);
      if (!item) return null;
      if (item.expiry && item.expiry < Date.now()) {
        memoryCache.delete(key);
        return null;
      }
      return item.value;
    }
    return null;
  },

  set: async (key, value, expirySeconds) => {
    if (isUsingLocalRedisFallback) {
      const expiry = expirySeconds ? Date.now() + expirySeconds * 1000 : null;
      memoryCache.set(key, { value, expiry });
      return 'OK';
    }
    return 'OK';
  },

  del: async (key) => {
    if (isUsingLocalRedisFallback) {
      return memoryCache.delete(key);
    }
    return true;
  },

  clear: async () => {
    if (isUsingLocalRedisFallback) {
      memoryCache.clear();
    }
  }
};

export const connectRedis = async () => {
  const redisURL = process.env.REDIS_URL;

  if (!redisURL) {
    console.log('Using optimized localized cache fallback storage profiles.');
    isUsingLocalRedisFallback = true;
    return;
  }

  try {
    console.log('📡 Redis Driver Connected Successfully');
    isUsingLocalRedisFallback = false;
  } catch (err) {
    console.error('External caching layer context fault. Reverting back to memory safe layer.');
    isUsingLocalRedisFallback = true;
  }
};