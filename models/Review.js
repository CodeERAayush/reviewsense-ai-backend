import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  playStoreReviewId: { type: String, required: true, unique: true },
  appId: { type: String, required: true },
  userName: { type: String },
  userImage: { type: String },
  date: { type: Date },
  score: { type: Number },
  scoreText: { type: String },
  url: { type: String },
  title: { type: String },
  text: { type: String },
  replyDate: { type: Date },
  replyText: { type: String },
  version: { type: String },
  thumbsUp: { type: Number },
  criterias: [{ type: mongoose.Schema.Types.Mixed }],
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
