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
  copilotOptimizeProduct,
  updateProductPricing,
  convertExcelToCsv,
  rerunProductVision
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

// Multer file filter (accept CSV and Excel files)
const fileFilter = (req, file, cb) => {
  const filetypes = /csv|xlsx|xls/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream'
  ];
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)'));
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
router.post('/convert-excel', upload.single('file'), convertExcelToCsv);
router.get('/:id/status', getBatchStatus);
router.delete('/:id', deleteBatch);
router.get('/:id/products', getBatchProducts);

router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/publish', publishProduct);
router.post('/products/bulk-publish', bulkPublishProducts);
router.post('/products/single', addSingleProduct);
router.post('/products/:id/copilot', copilotOptimizeProduct);
router.put('/products/:id/pricing', updateProductPricing);
router.post('/products/:id/vision', rerunProductVision);

export default router;
