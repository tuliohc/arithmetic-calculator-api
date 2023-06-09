import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { environment } from '../config/environment';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authExpirationTime = parseInt(environment.JWT_TOKEN_EXPIRATION_TIME, 10) * 60 * 1000

const { NODE_ENV } = process.env;
const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  maxAge: authExpirationTime,
  sameSite: NODE_ENV === 'production' ? ('none' as 'none') : ('lax' as 'lax')
};

export default {

  async signin(req: Request, res: Response) {
    const { JWT_SECRET } = environment;
    try {
      const { username, password } = req.body;
      const user = await UserModel.findOne({ username });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
  
      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Create a JWT token with the user ID and username
      const token = jwt.sign(
        { userId: user._id, username: user.username }, 
        JWT_SECRET, 
        { expiresIn: authExpirationTime }
      );

      res.cookie('arithmeticCalculatorApp_jwtToken', token, cookieOptions);
  
      // Return a success message as part of the response
      res.json({ message: 'Sign-in successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },
  async signout(req: Request, res: Response) {
    try {
      res.clearCookie('arithmeticCalculatorApp_jwtToken');
      res.json({ message: 'Sign-out successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },
  
  async checkAuth(req: Request, res: Response) {
    try {

      // Get the JWT token from the HttpOnly cookie
      const token = req.cookies['arithmeticCalculatorApp_jwtToken'];

      if (!token) {
        return res.status(401).json({ authenticated: false });
      }

      // Verify the token
      jwt.verify(token, environment.JWT_SECRET);
      
      // If the token is valid, return an authenticated status
      res.json({ authenticated: true });
    } catch (error) {
      // If the token is invalid, return an unauthenticated status
      res.status(400).json({ authenticated: false });
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