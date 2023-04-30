import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';

export default {
  async signin(req: Request, res: Response) {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ message: 'Authentication successful' });
  },
};