import { requireAuth } from '../../src/middlewares/auth.middleware';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


interface AuthRequest extends Request {
  userId?: string;
}

describe('requireAuth Middleware', () => {

  const secret = process.env.JWT_SECRET || 'secret';

  it('should set the userId on the request object when given a valid token', () => {
    const token = jwt.sign({ userId: '123' }, secret);
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as AuthRequest;
    const res = {} as Response;
    const next = jest.fn() as unknown as NextFunction;
    requireAuth(req, res, next);

    expect(req.userId).toEqual('123');
    expect(next).toHaveBeenCalled();
  });
});