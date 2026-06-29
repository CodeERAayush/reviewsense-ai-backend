import { pipeline } from '@xenova/transformers';

class EmbeddingService {
  constructor() {
    this.modelName = 'Xenova/all-MiniLM-L6-v2';
    this.pipeline = null;
  }

  async initialize() {
    try {
      if (!this.pipeline) {
        this.pipeline = await pipeline('feature-extraction', this.modelName);
        console.log(`Transformer model ${this.modelName} loaded successfully.`);
      }
    } catch (error) {
      console.error('Failed to load transformer model:', error);
    }
  }

  async generateEmbedding(text) {
    if (!this.pipeline) {
      await this.initialize();
    }

    const output = await this.pipeline(text, { pooling: 'mean', normalize: true });

    return Array.from(output.data);
  }
}

const embeddingService = new EmbeddingService();
export default embeddingService;
