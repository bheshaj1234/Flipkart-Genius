import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = parseInt(process.env.REDIS_PORT || '6379');
const password = process.env.REDIS_PASSWORD || undefined;

let redis = null;

try {
  const connectionOptions = {
    host,
    port,
    connectTimeout: 2000,
    commandTimeout: 1500,
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false
  };
  
  if (password) {
    connectionOptions.password = password;
  }
  
  redis = new Redis(connectionOptions);
  
  redis.on('connect', () => {
    console.log('✔ Redis Caching Client Connected.');
  });
  
  redis.on('error', (err) => {
    console.warn('⚠ Redis Caching error (bypassing cache):', err.message);
  });
} catch (error) {
  console.warn('⚠ Failed to initialize Redis caching client (bypassing cache):', error.message);
}

export default redis;
