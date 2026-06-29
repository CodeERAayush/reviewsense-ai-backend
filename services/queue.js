import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import Review from '../models/Review.js';
import qdrantClient, { ensureCollection } from './qdrant.js';
import embeddingService from './embedding.js';

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const reviewsQueue = new Queue('reviews', { 
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

await ensureCollection('reviews');

const worker = new Worker('reviews', async (job) => {
  const reviewData = job.data.review;
  const appId = job.data.appId;
  const playStoreReviewId = reviewData.id;

  try {
    const existingReview = await Review.findOne({ playStoreReviewId });
    if (existingReview) {
      console.log(`Review ${playStoreReviewId} already exists in DB. Skipping.`);
      return;
    }

    const newReview = new Review({
      playStoreReviewId,
      appId,
      userName: reviewData.userName,
      userImage: reviewData.userImage,
      date: reviewData.date,
      score: reviewData.score,
      scoreText: reviewData.scoreText,
      url: reviewData.url,
      title: reviewData.title,
      text: reviewData.text,
      replyDate: reviewData.replyDate,
      replyText: reviewData.replyText,
      version: reviewData.version,
      thumbsUp: reviewData.thumbsUp,
      criterias: reviewData.criterias,
    });
    const savedReview = await newReview.save();
    console.log(`Review ${playStoreReviewId} saved to MongoDB.`);

    if (!savedReview.text || savedReview.text.trim() === '') {
      console.log(`Review ${playStoreReviewId} has no text to embed. Skipping Qdrant.`);
      return;
    }

    const embedding = await embeddingService.generateEmbedding(savedReview.text);

    if (qdrantClient) {
      await qdrantClient.upsert('reviews', {
        wait: true,
        points: [
          {
            id: playStoreReviewId,
            vector: embedding,
            payload: {
              appId: savedReview.appId,
              mongo_id: savedReview._id.toString(),
              text: savedReview.text,
              app_version: savedReview.version || null
            }
          }
        ]
      });
      console.log(`Review ${playStoreReviewId} saved to Qdrant.`);
    } else {
      console.warn(`Qdrant client not initialized, skipping vector store insert for ${playStoreReviewId}.`);
    }

  } catch (error) {
    console.error(`Error processing review ${playStoreReviewId}:`, error);
    throw error;
  }
}, { connection: redisConnection });

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

export default { reviewsQueue };
