import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET || 'secret';

  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];

  // Verify the token and extract the user ID
  try {
    const decoded = jwt.verify(token, secret);
    req.userId = (decoded as any).userId;
    next();
  } catch (error) {
    // console.error(error);
    res.status(401).json({ error: 'Invalid token' });
  }
}