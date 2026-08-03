import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import {
  uploadBatch,
  getBatchStatus,
  getBatchProducts,
  updateProduct,
  publishProduct,
  bulkPublishProducts,
  getBatches,
  deleteProduct,
  deleteBatch,
  addSingleProduct,
  copilotOptimizeProduct
} from '../controllers/batchController.js';

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Multer file filter (accept only CSV)
const fileFilter = (req, file, cb) => {
  const filetypes = /csv/;
  const mimetype = file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel';
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Please upload a valid CSV file (.csv)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

// Apply auth middleware to protect all routes
router.use(protect);

router.get('/', getBatches);
router.post('/upload', upload.single('file'), uploadBatch);
router.get('/:id/status', getBatchStatus);
router.delete('/:id', deleteBatch);
router.get('/:id/products', getBatchProducts);

router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/publish', publishProduct);
router.post('/products/bulk-publish', bulkPublishProducts);
router.post('/products/single', addSingleProduct);
router.post('/products/:id/copilot', copilotOptimizeProduct);

export default router;
