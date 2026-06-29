import express from 'express';
import appStore from 'app-store-scraper';

const router = express.Router();

router.get('/reviews', async (req, res) => {
  const appId = req.query.appId || (req.user && req.user.appStoreId);
  if (!appId) {
    return res.status(400).json({ error: 'appId query parameter or user appStoreId is required' });
  }

  try {
    const reviews = await appStore.reviews({
      appId: appId,
      sort: appStore.sort.RECENT,
      page: 1
    });
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching App Store reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/app-details', async (req, res) => {
  const appId = req.query.appId || (req.user && req.user.appStoreId);

  if (!appId) {
    return res.status(400).json({ error: 'appId query parameter or user appStoreId is required' });
  }

  try {
    const appDetails = await appStore.app({ appId: appId });
    res.json(appDetails);
  } catch (error) {
    console.error('Error fetching App Store app details:', error);
    res.status(500).json({ error: 'Failed to fetch app details' });
  }
});

export default router;
