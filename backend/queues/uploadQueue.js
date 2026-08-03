import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.REDIS_HOST || '127.0.0.1';
const port = parseInt(process.env.REDIS_PORT || '6379');
const password = process.env.REDIS_PASSWORD || undefined;
const isLocal = host === '127.0.0.1' || host === 'localhost';

const connection = {
  host,
  port,
  password,
  ...(isLocal ? {} : { tls: {} })
};

// Initialize BullMQ Queue
export const uploadQueue = new Queue('upload-enrichment-queue', {
  connection
});

/**
 * Add product rows to queue for async worker processing
 */
export const addBatchJobs = async (batchId, products) => {
  const jobs = products.map(product => ({
    name: 'enrich-row',
    data: {
      productId: product._id,
      batchId,
      rawInput: product.rawInput
    },
    opts: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      }
    }
  }));

  // Push all jobs to BullMQ queue
  await uploadQueue.addBulk(jobs);
  console.log(`📡 Queued ${jobs.length} enrichment jobs for batch ${batchId}`);
};
