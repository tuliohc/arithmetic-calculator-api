import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export default {
  async signin(req: Request, res: Response) {
    const secret = process.env.JWT_SECRET || 'secret';
    
    try {
      const { username, password } = req.body;
      const user = await UserModel.findOne({ username, password });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Create a JWT token with the user ID and username
      const token = jwt.sign({ userId: user._id, username: user.username }, secret);
  
      // Return the token as part of the response
      res.json({ token });
    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },
  async logout(req: Request, res: Response) {
    try {
      res.clearCookie('token'); // clear the token cookie
      res.json({ message: 'Logout successful' });
    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },
  async getUserBalance(req: AuthenticatedRequest, res: Response) {
    try {
      // Get the authenticated user's ID from the request
      const { userId } = req as any;

      // Find the user by ID and retrieve their balance
      const user = await UserModel.findById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      // Return the user's balance
      res.json({ balance: user.balance });
    } catch (error) {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },

};