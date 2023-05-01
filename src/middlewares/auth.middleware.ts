import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { environment } from '../config/environment';

interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const secret = environment.JWT_SECRET;

  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];

  // Verify the token and extract the user ID
  try {
    const decoded = jwt.verify(token, secret);
    const userId = (decoded as any).userId;

    // Check that the user ID in the request matches the authenticated user's ID
    if (req.params.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Store the userId in the request object
    req.userId = userId

    next();
  } catch (error) {
    // console.error(error);
    res.status(401).json({ error: 'Invalid token' });
  }
}