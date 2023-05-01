import mongoose from 'mongoose';
import { environment } from './environment';
import { seed } from './seed';

const MONGODB_URI = environment.MONGODB_URI;

const connectDB = async () => {
  try {
    await seed()
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
