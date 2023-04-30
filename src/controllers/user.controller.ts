import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

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
      console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};