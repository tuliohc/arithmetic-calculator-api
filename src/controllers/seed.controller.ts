
import { Request, Response } from 'express';
import { environment } from '../config/environment';
import mongoose from 'mongoose';
import { UserModel, OperationModel } from '../models';
import initialOperations from '../seed/operations-seed.json';
import initialUsers from '../seed/users-seed.json'

export default {
  async seed(req: Request, res: Response) {
    try {
      try {
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

        console.log('Seeds successfully synced');

        res.json({ status: 'Seeds successfully synced' });
        
      } catch (error) {
        console.error('Error seeding the database:', error);
        process.exit(1);
      }

    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};