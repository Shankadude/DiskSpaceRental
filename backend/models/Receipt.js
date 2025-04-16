import mongoose from 'mongoose';

const receiptSchema = new mongoose.Schema({
  user: { type: String, required: true },
  provider: { type: String },
  storageId: { type: Number },
  duration: { type: String },
  cid: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Receipt = mongoose.model('Receipt', receiptSchema);
export default Receipt;
