import mongoose from 'mongoose';

const CategorySchemaSchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: [true, 'Please add a category name'],
    unique: true,
    trim: true
  },
  requiredFields: {
    type: [String],
    default: ['title', 'price', 'category']
  },
  attributeOptions: {
    type: Map,
    of: [String],
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CategorySchema', CategorySchemaSchema);
