import express from 'express';
import multer from 'multer';
import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-file', upload.single('file'), async (req, res) => {
  try {
    const helia = await createHelia();
    const fs = unixfs(helia);
    const buffer = req.file.buffer;
    const cid = await fs.addBytes(buffer);

    res.json({ cid: cid.toString(), url: `https://ipfs.io/ipfs/${cid.toString()}` });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: "Failed to upload file to IPFS" });
  }
});

export default router;
