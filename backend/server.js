import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import metadataRoutes from './routes/metadata.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', metadataRoutes);
app.use('/api', uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running at http://localhost:${process.env.PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB Error:", err));
