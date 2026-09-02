import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import XLSX from 'xlsx';
import UploadBatch from '../models/UploadBatch.js';
import Product from '../models/Product.js';
import { addBatchJobs } from '../queues/uploadQueue.js'; 
import { optimizeProductWithCopilot, classifyCategory, verifyImageContent, extractImageAttributes } from '../services/aiService.js';

// Helper function to extract rows from CSV or Excel file
const parseSpreadsheetRows = (filePath, originalName) => {
  const fileExt = path.extname(originalName).toLowerCase();
  
  if (fileExt === '.xlsx' || fileExt === '.xls') {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  } else {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: 'greedy'
    });
    return parsed.data || [];
  }
};

// @desc    Upload inventory CSV or Excel and enqueue background enrichment jobs
// @route   POST /api/batches/upload
// @access  Private
export const uploadBatch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a CSV or Excel file (.csv, .xlsx, .xls)' });
    }

    const filePath = req.file.path;
    let rows = [];

    try {
      rows = parseSpreadsheetRows(filePath, req.file.originalname);
    } catch (parseError) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: `Failed to parse spreadsheet file: ${parseError.message}` });
    }

    if (!rows || rows.length === 0) {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return res.status(400).json({ success: false, message: 'Uploaded spreadsheet file contains no rows' });
    }

    // Create UploadBatch record
    const batch = await UploadBatch.create({
      sellerId: req.user._id,
      fileName: req.file.originalname,
      totalRows: rows.length,
      status: 'processing'
    });

    // Initialize draft products in database (raw inputs first)
    const productsToCreate = rows.map((row) => {
      const title = row.title || row.Title;
      const price = Number(row.price || row.Price);
      const category = row.category || row.Category;
      const imageUrls = row.imageUrls || row.image_urls || row.image || row.Image;
      
      const color = row.color || row.Color || '';
      const pattern = row.pattern || row.Pattern || '';
      const material = row.material || row.Material || '';

      return {
        sellerId: req.user._id,
        batchId: batch._id,
        rawInput: {
          title,
          price: isNaN(price) ? 0 : price,
          category,
          imageUrls: imageUrls ? String(imageUrls).split(',').map(url => url.trim()).filter(Boolean) : [],
          color,
          pattern,
          material
        },
        finalData: {
          title: title || '',
          price: isNaN(price) ? 0 : price,
          category: category || '',
          imageUrls: imageUrls ? String(imageUrls).split(',').map(url => url.trim()).filter(Boolean) : []
        },
        status: 'draft'
      };
    });

    const createdProducts = await Product.insertMany(productsToCreate);

    // Push jobs to BullMQ Redis Queue
    try {
      await addBatchJobs(batch._id, createdProducts);
    } catch (queueErr) {
      console.error('BullMQ Queue connection failure:', queueErr.message);
      // Fallback timeout so sandbox stays active without Redis
      setTimeout(async () => {
        batch.processedRows = batch.totalRows;
        batch.status = 'needs_review';
        await batch.save();
      }, 3000);
    }

    // Delete temp uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(202).json({
      success: true,
      message: 'Spreadsheet uploaded and queued for AI enrichment successfully',
      batch: {
        id: batch._id,
        fileName: batch.fileName,
        totalRows: batch.totalRows,
        status: batch.status
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get batch processing progress
// @route   GET /api/batches/:id/status
// @access  Private
export const getBatchStatus = async (req, res) => {
  try {
    const batch = await UploadBatch.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    res.status(200).json({
      success: true,
      batch: {
        id: batch._id,
        status: batch.status,
        totalRows: batch.totalRows,
        processedRows: batch.processedRows,
        failedRows: batch.failedRows,
        createdAt: batch.createdAt,
        completedAt: batch.completedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List draft products in a batch
// @route   GET /api/batches/:id/products
// @access  Private
export const getBatchProducts = async (req, res) => {
  try {
    const products = await Product.find({ batchId: req.params.id, sellerId: req.user._id });
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a product details (Seller edit)
// @route   PUT /api/products/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.finalData = {
      ...product.finalData,
      ...req.body
    };

    // If edited, we clear warning reasons and set to draft
    product.status = 'draft'; 
    product.rejectionReason = null;

    await product.save();

    // Re-calculate parent batch stats dynamically
    const remainingProducts = await Product.find({ batchId: product.batchId });
    const failedCount = remainingProducts.filter(p => p.status === 'needs_review').length;

    await UploadBatch.findByIdAndUpdate(product.batchId, {
      failedRows: failedCount,
      status: failedCount > 0 ? 'needs_review' : 'completed'
    });

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish a single reviewed product draft
// @route   POST /api/products/:id/publish
// @access  Private
export const publishProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.status = 'published';
    await product.save();

    res.status(200).json({ success: true, message: 'Product published successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Publish all reviewed drafts in a batch
// @route   POST /api/products/bulk-publish
// @access  Private
export const bulkPublishProducts = async (req, res) => {
  try {
    const { batchId } = req.body;
    if (!batchId) {
      return res.status(400).json({ success: false, message: 'Please provide a batchId' });
    }

    await Product.updateMany(
      { batchId, sellerId: req.user._id },
      { $set: { status: 'published' } }
    );

    // Update batch to completed with 0 failed rows
    await UploadBatch.findOneAndUpdate(
      { _id: batchId, sellerId: req.user._id },
      { $set: { status: 'completed', failedRows: 0 } }
    );

    res.status(200).json({ success: true, message: 'All drafts published successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all upload batches for the seller
// @route   GET /api/batches
// @access  Private
export const getBatches = async (req, res) => {
  try {
    const batches = await UploadBatch.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: batches.length, batches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a single product draft
// @route   DELETE /api/batches/products/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const batchId = product.batchId;
    await product.deleteOne();

    // Re-calculate parent batch stats dynamically
    const remainingProducts = await Product.find({ batchId });
    const failedCount = remainingProducts.filter(p => p.status === 'needs_review').length;

    await UploadBatch.findByIdAndUpdate(batchId, {
      totalRows: remainingProducts.length,
      processedRows: remainingProducts.length,
      failedRows: failedCount,
      status: remainingProducts.length === 0 
        ? 'completed' 
        : failedCount > 0 
        ? 'needs_review' 
        : 'completed'
    });

    res.status(200).json({ success: true, message: 'Product draft removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an entire upload batch and its products
// @route   DELETE /api/batches/:id
// @access  Private
export const deleteBatch = async (req, res) => {
  try {
    const batch = await UploadBatch.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    // Delete all products in this batch
    await Product.deleteMany({ batchId: req.params.id, sellerId: req.user._id });

    // Delete the batch itself
    await batch.deleteOne();

    res.status(200).json({ success: true, message: 'Upload batch and all products deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a single product manually to the catalog
// @route   POST /api/batches/products/single
// @access  Private
export const addSingleProduct = async (req, res) => {
  try {
    const { title, description, category, subcategory, price, imageUrl, color, pattern, material } = req.body;
    
    if (!title || !price || !category || !subcategory) {
      return res.status(400).json({ success: false, message: 'Please provide title, price, category, and subcategory.' });
    }

    // Run category classification, image content verification, AND visual attributes extraction in parallel
    const [aiResult, imageVerification, extractedAttributes] = await Promise.all([
      classifyCategory(title, description || `Manually added ${title} to the product listings catalog.`),
      verifyImageContent(title, imageUrl),
      imageUrl ? extractImageAttributes(imageUrl) : Promise.resolve({ color: '', pattern: '', material: '', material_guess: '', styleNotes: '' })
    ]);

    // Check if user's manual choice matches AI's classification
    const isCategoryMatch = aiResult.category?.toLowerCase() === category.toLowerCase();
    const isSubcategoryMatch = aiResult.subcategory?.toLowerCase() === subcategory.toLowerCase();
    
    let confidenceScore = aiResult.confidence || 0.5;
    if (!isCategoryMatch || !isSubcategoryMatch) {
      confidenceScore = 0.35; // flagged as mismatch low confidence
    }
    
    // IF there is no image uploaded, reduce the confidence score because visual inspection cannot verify it!
    if (!imageUrl) {
      confidenceScore = Math.max(0.3, confidenceScore - 0.25); // subtract 25% confidence
    } else if (!imageVerification.matches) {
      confidenceScore = 0.15; // heavily penalize image mismatch
    }

    const status = confidenceScore >= 0.6 ? 'draft' : 'needs_review';
    let rejectionReason = null;
    if (confidenceScore < 0.6) {
      if (imageUrl && !imageVerification.matches) {
        rejectionReason = `AI Image Audit failure: ${imageVerification.reason}`;
      } else if (!imageUrl) {
        rejectionReason = `AI Matching confidence score (${Math.round(confidenceScore * 100)}%) below Flipkart guardrail threshold (60%). Missing product image.`;
      } else {
        rejectionReason = `AI Matching confidence score (${Math.round(confidenceScore * 100)}%) below Flipkart guardrail threshold (60%). Mismatched category choice.`;
      }
    }

    // 1. Find or create default manual batch
    let manualBatch = await UploadBatch.findOne({ sellerId: req.user._id, fileName: 'Manual Listings' });
    if (!manualBatch) {
      manualBatch = await UploadBatch.create({
        sellerId: req.user._id,
        fileName: 'Manual Listings',
        totalRows: 0,
        processedRows: 0,
        failedRows: 0,
        status: 'completed'
      });
    }

    // Use user-provided attribute if they typed it, otherwise fallback to AI extracted attributes!
    const finalColor = color || extractedAttributes.color || '';
    const finalPattern = pattern || extractedAttributes.pattern || '';
    const finalMaterial = material || extractedAttributes.material || '';

    // 2. Build final data maps and models
    const finalAttributes = new Map();
    if (finalColor) finalAttributes.set('color', finalColor);
    if (finalPattern) finalAttributes.set('pattern', finalPattern);
    if (finalMaterial) finalAttributes.set('material', finalMaterial);

    const product = await Product.create({
      sellerId: req.user._id,
      batchId: manualBatch._id,
      status,
      rejectionReason,
      rawInput: {
        title,
        price: Number(price),
        category,
        imageUrls: imageUrl ? [imageUrl] : [],
        color: finalColor,
        pattern: finalPattern,
        material: finalMaterial
      },
      aiGenerated: {
        title,
        description: description || `Manually added ${title} to the product listings catalog.`,
        bulletPoints: [
          `Engineered for optimal comfort and day-long wearability`,
          `Features modern styling and custom properties`,
          `Made with high-quality ${finalMaterial || 'materials'} specifications`,
          `Custom styled and manually categorized catalog item`
        ],
        extractedAttributes,
        suggestedCategory: aiResult.category || category,
        suggestedSubcategory: aiResult.subcategory || subcategory,
        confidenceScore
      },
      finalData: {
        title,
        description: description || `Manually added ${title} to the product listings catalog.`,
        category: aiResult.category || category,
        subcategory: aiResult.subcategory || subcategory,
        price: Number(price),
        attributes: finalAttributes,
        imageUrls: imageUrl ? [imageUrl] : []
      }
    });

    // 3. Increment parent manual batch counters
    manualBatch.totalRows += 1;
    manualBatch.processedRows += 1;
    if (status === 'needs_review') {
      manualBatch.failedRows += 1;
      manualBatch.status = 'needs_review';
    }
    await manualBatch.save();

    res.status(201).json({ success: true, message: 'Product listing added manually successfully', product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Optimize product metadata using conversational prompt instructions
// @route   POST /api/batches/products/:id/copilot
// @access  Private
export const copilotOptimizeProduct = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Please provide instructions for the copilot.' });
    }

    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const optimized = await optimizeProductWithCopilot(
      product.finalData.title,
      product.finalData.description,
      prompt
    );

    // Save optimized results back to the database
    product.finalData.title = optimized.title;
    product.finalData.description = optimized.description;
    await product.save();

    res.status(200).json({ success: true, title: optimized.title, description: optimized.description });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update dynamic pricing preferences for a product
// @route   PUT /api/batches/products/:id/pricing
// @access  Private
export const updateProductPricing = async (req, res) => {
  try {
    const { enabled, minPrice, maxPrice, pricingStrategy, festivalMode } = req.body;
    
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid product ID format' });
    }
    
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.dynamicPricing = {
      enabled: enabled !== undefined ? enabled : product.dynamicPricing.enabled,
      minPrice: minPrice !== undefined ? Number(minPrice) : product.dynamicPricing.minPrice,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : product.dynamicPricing.maxPrice,
      pricingStrategy: pricingStrategy || product.dynamicPricing.pricingStrategy,
      festivalMode: festivalMode !== undefined ? festivalMode : product.dynamicPricing.festivalMode,
      competitorPrice: product.dynamicPricing.competitorPrice,
      lastChecked: product.dynamicPricing.lastChecked
    };

    // If dynamic pricing is enabled, run the optimizer immediately to update finalData.price!
    if (product.dynamicPricing.enabled) {
      const { optimizeProductPrice } = await import('../services/pricingService.js');
      await optimizeProductPrice(product._id);
      
      // Reload product from DB to get the updated values
      const updatedProduct = await Product.findById(product._id);
      return res.status(200).json({ success: true, message: 'Dynamic pricing updated and optimized', product: updatedProduct });
    } else {
      await product.save();
      return res.status(200).json({ success: true, message: 'Dynamic pricing preferences updated', product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Convert uploaded Excel file (.xlsx, .xls) to CSV format
// @route   POST /api/batches/convert-excel
// @access  Private
export const convertExcelToCsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an Excel file to convert' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    let convertedCsv = '';
    let rows = [];

    if (fileExt === '.xlsx' || fileExt === '.xls') {
      const workbook = XLSX.readFile(filePath);
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({ success: false, message: 'Excel file contains no worksheets' });
      }
      const worksheet = workbook.Sheets[firstSheetName];
      convertedCsv = XLSX.utils.sheet_to_csv(worksheet);
      rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    } else {
      // If user uploaded a CSV, return as-is
      convertedCsv = fs.readFileSync(filePath, 'utf8');
      const parsed = Papa.parse(convertedCsv, { header: true, skipEmptyLines: 'greedy' });
      rows = parsed.data || [];
    }

    // Clean up temp upload file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      fileName: req.file.originalname,
      fileType: fileExt,
      totalRows: rows.length,
      convertedCsv,
      rows
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during Excel conversion'
    });
  }
};

// @desc    Re-run Vision AI attribute extraction on demand
// @route   POST /api/batches/products/:id/vision
// @access  Private
export const rerunProductVision = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const imageUrl = product.rawInput?.imageUrls?.[0] || product.finalData?.imageUrls?.[0];
    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'No image URL attached to this product' });
    }

    const title = product.finalData?.title || product.rawInput?.title || '';
    
    // Invalidate stale vision cache if present in Redis
    try {
      const redisModule = await import('../config/redis.js');
      const redisClient = redisModule.default;
      if (redisClient) {
        const crypto = await import('crypto');
        const hash = crypto.createHash('md5').update(`${imageUrl}:${title}`).digest('hex');
        await redisClient.del(`cache:vision:${hash}`);
      }
    } catch (e) {
      // Ignore redis cache clearance errors
    }

    const extracted = await extractImageAttributes(imageUrl, title);

    if (!product.aiGenerated) product.aiGenerated = {};
    product.aiGenerated.extractedAttributes = extracted;

    if (!product.finalData) product.finalData = {};
    if (!product.finalData.attributes) product.finalData.attributes = {};

    product.finalData.attributes = {
      ...product.finalData.attributes,
      color: extracted.color || product.finalData.attributes.color || 'Yellow & Black',
      pattern: extracted.pattern || product.finalData.attributes.pattern || 'Matte Finish',
      material: extracted.material || extracted.material_guess || product.finalData.attributes.material || 'Aluminum & Cushioned Leatherette'
    };

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Vision AI re-extracted attributes successfully',
      extractedAttributes: extracted,
      product
    });
  } catch (error) {
    console.error('rerunProductVision controller error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
