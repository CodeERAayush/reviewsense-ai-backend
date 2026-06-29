import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import playStoreRoutes from './routes/playStore.js';
import appStoreRoutes from './routes/appStore.js';
import authRoutes from './routes/auth.js';
import authMiddleware from './middleware/auth.js';

import qdrantClient from './services/qdrant.js';
import embeddingService from './services/embedding.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reviewsense';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

embeddingService.initialize().catch(err => console.error('Error pre-loading transformer model:', err));

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ReviewSenseAI Backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/play-store', authMiddleware, playStoreRoutes);
app.use('/api/app-store', authMiddleware, appStoreRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
