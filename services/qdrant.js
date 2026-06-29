import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

const qdrantUrl = process.env.QDRANT_URL;
const qdrantApiKey = process.env.QDRANT_API_KEY;

let qdrantClient = null;

try {
  qdrantClient = new QdrantClient({
    url: qdrantUrl,
    apiKey: qdrantApiKey || undefined,
  });
  console.log('Qdrant Client initialized successfully');
} catch (error) {
  console.error('Error initializing Qdrant client:', error);
}

export const ensureCollection = async (collectionName) => {
  if (!qdrantClient) return;
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(c => c.name === collectionName);

    if (!exists) {
      await qdrantClient.createCollection(collectionName, {
        vectors: {
          size: 384,
          distance: 'Cosine'
        }
      });
      console.log(`Qdrant collection '${collectionName}' created successfully. Waiting for cluster to sync...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log(`Qdrant collection '${collectionName}' already exists.`);
    }

    try {
      await qdrantClient.createPayloadIndex(collectionName, {
        field_name: 'appId',
        field_schema: 'keyword',
        wait: true
      });
      console.log(`Payload index for 'appId' ensured on '${collectionName}'.`);
    } catch (idxError) {
      // Qdrant usually ignores if index already exists, but we catch just in case
      console.warn(`Warning ensuring payload index for 'appId':`, idxError.message || idxError);
    }

  } catch (error) {
    console.error(`Error ensuring collection '${collectionName}':`, error);
    throw error; // Throw so we can see what's actually failing during startup
  }
};

export default qdrantClient;
