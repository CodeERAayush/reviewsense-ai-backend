import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  appStoreId: {
    type: String,
  },
  playStoreId: {
    type: String,
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
