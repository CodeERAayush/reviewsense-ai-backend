import express from 'express';
import gplay from 'google-play-scraper';
import { reviewsQueue } from '../services/queue.js';
import qdrantClient from '../services/qdrant.js';
import embeddingService from '../services/embedding.js';

const router = express.Router();

router.get('/reviews', async (req, res) => {
  const { items } = req.query;
  const appId = req.query.appId || (req.user && req.user.playStoreId);

  if (!appId) {
    return res.status(400).json({ error: 'appId query parameter or user playStoreId is required' });
  }

  try {
    const reviews = await gplay.reviews({
      appId: appId,
      sort: gplay.sort.NEWEST,
      num: items || 100
    });

    const reviewsData = Array.isArray(reviews) ? reviews : (reviews.data || []);

    const jobs = reviewsData.map(review => ({
      name: 'process-review',
      data: { review, appId }
    }));

    if (jobs.length > 0) {
      await reviewsQueue.addBulk(jobs);
    }

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching Google Play reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/app-details', async (req, res) => {
  const appId = req.query.appId || (req.user && req.user.playStoreId);

  if (!appId) {
    return res.status(400).json({ error: 'appId query parameter or user playStoreId is required' });
  }

  try {
    const appDetails = await gplay.app({ appId: appId });
    res.json(appDetails);
  } catch (error) {
    console.error('Error fetching Google Play app details:', error);
    res.status(500).json({ error: 'Failed to fetch app details' });
  }
});

router.post('/ask/play-review', async (req, res) => {
  try {
    const { question, limit } = req.body;
    const appId = req.body.appId || req.query.appId || (req.user && req.user.playStoreId);

    if (!question) {
      return res.status(400).json({ error: 'question field is required in the body' });
    }

    if (!qdrantClient) {
      return res.status(500).json({ error: 'Qdrant client is not initialized' });
    }

    const embedding = await embeddingService.generateEmbedding(question);

    const searchOptions = {
      vector: embedding,
      limit: limit || 5,
      with_payload: true,
    };

    if (appId) {
      searchOptions.filter = {
        must: [
          {
            key: "appId",
            match: {
              value: appId
            }
          }
        ]
      };
    }

    const searchResult = await qdrantClient.search('reviews', searchOptions);

    res.json({ results: searchResult });
  } catch (error) {
    console.error('Error during semantic search:', error);
    res.status(500).json({ error: 'Failed to perform semantic search' });
  }
});

export default router;
