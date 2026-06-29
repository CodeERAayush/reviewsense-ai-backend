# ReviewSenseAI Backend

ReviewSenseAI Backend is a Node.js-based application designed to scrape, process, and analyze app reviews from both the Google Play Store and the Apple App Store. It leverages AI models (via Hugging Face's Xenova transformers) to generate vector embeddings for semantic search and uses Gemma 3 for intelligent review analysis. It stores data in Qdrant for vector search, alongside MongoDB for structured data storage and Redis/BullMQ for asynchronous job processing.

## Key Features

- **App Data Scraping**: Fetch app details and reviews from the Google Play Store and Apple App Store.
- **Authentication**: User signup and login functionality using JWT.
- **Review Analysis**: Utilizes Gemma 3 for deep, intelligent analysis of user reviews.
- **Vector Embeddings**: Generates semantic embeddings for app reviews using the `Xenova/all-MiniLM-L6-v2` model.
- **Vector Search**: Integrates with Qdrant for storing and querying vector embeddings.
- **Background Processing**: Uses BullMQ and Redis to process large volumes of reviews asynchronously.
- **Database**: MongoDB for user and general metadata storage.

## Tech Stack

- **Framework**: Express.js (Node.js)
- **Database**: MongoDB (Mongoose)
- **Vector Database**: Qdrant
- **Queue System**: BullMQ with Redis
- **Machine Learning**: `@xenova/transformers`, Gemma 3 (Review Analysis)
- **Scrapers**: `google-play-scraper`, `app-store-scraper`
- **Authentication**: JWT, bcryptjs

## Prerequisites

Make sure you have the following installed on your system:
- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas)
- Redis (Local or Cloud)
- Qdrant (Local Docker instance or Cloud)

## Environment Variables

Create a `.env` file in the root directory and add the following variables (adjust according to your `.env.example` or actual setup):

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
```

## Installation and Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd ReviewSenseAI_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Start the production server:**
   ```bash
   npm start
   ```

## Docker Setup

The project includes a `docker-compose.yml` and a `Dockerfile` for containerized environments. You can spin up the required services or the app using Docker Compose.

```bash
docker-compose up -d
```

## API Endpoints

The API consists of general routes, authentication routes, and authenticated routes for scraping data.

### General
- `GET /health`: Health check endpoint.

### Authentication
- `POST /api/auth/signup`: Create a new user.
- `POST /api/auth/login`: Login to receive a JWT.

### Play Store (Requires JWT)
- `GET /api/play-store/reviews?appId=<app_id>&items=<count>`: Fetch Play Store reviews.
- `GET /api/play-store/app-details?appId=<app_id>`: Fetch Play Store app details.

### App Store (Requires JWT)
- `GET /api/app-store/reviews?appId=<app_id>`: Fetch App Store reviews.
- `GET /api/app-store/app-details?appId=<app_id>`: Fetch App Store app details.

For more detailed API usage and cURL examples, refer to `api_curl_docs.txt`.

## License

ISC
