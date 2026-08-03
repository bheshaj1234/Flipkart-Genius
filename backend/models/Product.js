import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadBatch',
    required: true
  },
  rawInput: {
    title: { type: String },
    price: { type: Number },
    category: { type: String },
    imageUrls: { type: [String], default: [] }
  },
  aiGenerated: {
    title: { type: String },
    description: { type: String },
    bulletPoints: { type: [String], default: [] },
    extractedAttributes: {
      color: { type: String },
      pattern: { type: String },
      material: { type: String }
    },
    suggestedCategory: { type: String },
    suggestedSubcategory: { type: String },
    confidenceScore: { type: Number }
  },
  finalData: {
    title: { type: String },
    description: { type: String },
    category: { type: String },
    subcategory: { type: String },
    price: { type: Number },
    attributes: {
      type: Map,
      of: String,
      default: {}
    },
    imageUrls: { type: [String], default: [] }
  },
  status: {
    type: String,
    enum: ['draft', 'needs_review', 'published', 'rejected'],
    default: 'draft'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', ProductSchema);
