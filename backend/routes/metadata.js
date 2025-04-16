import express from 'express';
import { generateMetadata, getReceiptsByUser } from '../controllers/metadataController.js';

const router = express.Router();

router.post('/generate-metadata', generateMetadata);
router.get('/receipts/:address', getReceiptsByUser);

export default router;
