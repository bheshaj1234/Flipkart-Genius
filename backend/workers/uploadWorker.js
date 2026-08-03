import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';
import UploadBatch from '../models/UploadBatch.js';
import { generateProductListing, extractImageAttributes, classifyCategory, verifyImageContent } from '../services/aiService.js';
import { io } from '../server.js';

dotenv.config();

// Connect Mongoose inside worker process (runs on a separate process thread)
connectDB();

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

// Initialize BullMQ Worker
const worker = new Worker('upload-enrichment-queue', async (job) => {
  const { productId, batchId, rawInput } = job.data;
  console.log(`🤖 Processing product job ${productId} in batch ${batchId}...`);

  let product;
  try {
    product = await Product.findById(productId);
    if (!product) throw new Error('Product not found in database');

    // Socket status update: Starting AI classification
    emitLog(batchId, `[Row ${productId}] Starting classification and copies generation...`);

    // 1. Text generation (Title, Description, SEO highlights)
    const copyResult = await generateProductListing(rawInput.title, rawInput.category);
    
    // 2. Image vision attributes extraction (if image url exists)
    let extractedAttributes = { color: '', pattern: '', material: '' };
    let imageMatches = true;
    let imageReason = 'Image content verified';
    
    if (rawInput.imageUrls && rawInput.imageUrls.length > 0) {
      emitLog(batchId, `[Row ${productId}] Running vision extraction on image...`);
      extractedAttributes = await extractImageAttributes(rawInput.imageUrls[0]);
      
      emitLog(batchId, `[Row ${productId}] Auditing image content compliance...`);
      const verification = await verifyImageContent(rawInput.title, rawInput.imageUrls[0]);
      imageMatches = verification.matches;
      imageReason = verification.reason;
    }

    // 3. Category classification & confidence matching
    emitLog(batchId, `[Row ${productId}] Auditing category matching taxomy...`);
    const classification = await classifyCategory(rawInput.title, copyResult.description);

    // 4. Check confidence threshold (0.6)
    let confidenceScore = classification.confidence || 0.5;
    
    // Reduce confidence by 25% if there's no image, so it gets flagged for review!
    if (!rawInput.imageUrls || rawInput.imageUrls.length === 0) {
      confidenceScore = Math.max(0.3, confidenceScore - 0.25);
    } else if (!imageMatches) {
      confidenceScore = 0.15; // heavily penalize image mismatch
    }
    
    const status = confidenceScore >= 0.6 ? 'draft' : 'needs_review';
    let rejectionReason = null;
    if (confidenceScore < 0.6) {
      if (rawInput.imageUrls && rawInput.imageUrls.length > 0 && !imageMatches) {
        rejectionReason = `AI Image Audit failure: ${imageReason}`;
      } else if (!rawInput.imageUrls || rawInput.imageUrls.length === 0) {
        rejectionReason = `AI Matching confidence score (${Math.round(confidenceScore * 100)}%) below Flipkart guardrail threshold (60%). Missing product image.`;
      } else {
        rejectionReason = `AI Matching confidence score (${Math.round(confidenceScore * 100)}%) below Flipkart guardrail threshold (60%). Mismatched category choice.`;
      }
    }

    // 5. Update Product document
    product.aiGenerated = {
      title: copyResult.title,
      description: copyResult.description,
      bulletPoints: copyResult.bulletPoints,
      extractedAttributes,
      suggestedCategory: classification.category,
      suggestedSubcategory: classification.subcategory,
      confidenceScore
    };

    // Pre-populate finalData with suggestions
    product.finalData = {
      title: copyResult.title,
      description: copyResult.description,
      category: classification.category,
      subcategory: classification.subcategory,
      price: rawInput.price,
      attributes: extractedAttributes,
      imageUrls: rawInput.imageUrls
    };

    product.status = status;
    product.rejectionReason = rejectionReason;
    await product.save();

    // 6. Update UploadBatch stats in MongoDB
    const batch = await UploadBatch.findById(batchId);
    if (batch) {
      batch.processedRows += 1;
      if (status === 'needs_review') {
        batch.failedRows += 1; // track low-confidence items as reviews required
      }
      
      // If fully processed, mark completed
      if (batch.processedRows === batch.totalRows) {
        batch.status = batch.failedRows > 0 ? 'needs_review' : 'completed';
        batch.completedAt = new Date();
      }
      await batch.save();

      // Emit live updates to frontend clients via WebSockets
      io.emit(`batch-progress-${batchId}`, {
        processedRows: batch.processedRows,
        failedRows: batch.failedRows,
        status: batch.status
      });
    }

    emitLog(batchId, `✔ [Row ${productId}] Product details enriched successfully.`);
    console.log(`✔ Processed job ${productId} successfully`);
    return { success: true };

  } catch (error) {
    console.error(`✖ Job failed for product ${productId}:`, error.message);
    emitLog(batchId, `✖ [Row ${productId}] Failed: ${error.message}`);

    // Update batch fail records
    const batch = await UploadBatch.findById(batchId);
    if (batch) {
      batch.processedRows += 1;
      batch.failedRows += 1;
      if (batch.processedRows === batch.totalRows) {
        batch.status = 'needs_review';
        batch.completedAt = new Date();
      }
      await batch.save();

      io.emit(`batch-progress-${batchId}`, {
        processedRows: batch.processedRows,
        failedRows: batch.failedRows,
        status: batch.status
      });
    }

    if (product) {
      product.status = 'rejected';
      product.rejectionReason = error.message;
      await product.save();
    }

    throw error;
  }
}, { connection });

// Helper to emit logs via Socket.io
const emitLog = (batchId, message) => {
  io.emit(`batch-log-${batchId}`, {
    timestamp: new Date(),
    message
  });
};

console.log('🤖 BullMQ Background Worker listening to Redis queue...');

export default worker;
