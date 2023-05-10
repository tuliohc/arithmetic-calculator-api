
import { Request, Response } from 'express';;
import { UserModel, OperationModel } from '../models';
import initialOperations from '../seed/operations-seed.json';
import initialUsers from '../seed/users-seed.json'
import bcrypt from 'bcryptjs';

const saltRounds = 10;

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
    
        // Hash passwords
        const hashedUsers = await Promise.all(initialUsers.map(async user => {
          const hashedPassword = await bcrypt.hash(user.password, saltRounds);
          return { ...user, password: hashedPassword };
        }));

        // Insert users
        const users = await UserModel.create(hashedUsers)
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