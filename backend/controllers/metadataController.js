import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import Receipt from '../models/Receipt.js';

// POST /api/generate-metadata
export async function generateMetadata(req, res) {
  try {
    const helia = await createHelia();
    const fs = unixfs(helia);

    const buffer = Buffer.from(JSON.stringify(req.body));
    const cid = await fs.addBytes(buffer);
    const cidString = cid.toString();

    const saved = await Receipt.create({
      ...req.body,
      cid: cidString,
    });

    res.json({
      cid: cidString,
      url: `https://ipfs.io/ipfs/${cidString}`,
      receipt: saved,
    });
  } catch (err) {
    console.error("❌ Error uploading metadata:", err);
    res.status(500).json({ error: 'Failed to upload metadata' });
  }
}

// GET /api/receipts/:address
export async function getReceiptsByUser(req, res) {
  try {
    const { address } = req.params;
    const receipts = await Receipt.find({ user: address }).sort({ timestamp: -1 });
    res.json(receipts);
  } catch (err) {
    console.error("❌ Error fetching receipts:", err);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
}
