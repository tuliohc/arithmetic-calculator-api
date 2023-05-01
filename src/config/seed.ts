import mongoose from 'mongoose';
import { UserModel, OperationModel } from '../models';
import initialOperations from '../seed/operations-seed.json';
import initialUsers from '../seed/users-seed.json'

export const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Delete any existing operations in the database
    await OperationModel.deleteMany({});

    // Delete any existing users in the database
    await UserModel.deleteMany({});

    // Insert the initial operations
    const operations = await OperationModel.create(initialOperations);
    console.log(`Inserted ${operations.length} operations`);

    // Insert users
    const users = await UserModel.create(initialUsers)
    console.log(`Inserted ${users.length} user(s)`)

    mongoose.connection.close();
    console.log('Seeds successfully synced');
    
  } catch (error) {
    console.error('Error seeding the database:', error);
    process.exit(1);
  }
};
