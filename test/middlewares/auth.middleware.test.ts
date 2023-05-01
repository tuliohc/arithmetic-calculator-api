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
    const req = { 
      headers: { authorization: `Bearer ${token}` },
      params: { id: '123' } 
    } as unknown as AuthRequest;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(req.userId).toEqual('123');
    expect(next).toHaveBeenCalled();
  });

  it('should return a 401 error when not given a token', () => {
    const req = { headers: {} } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return a 401 error when given an invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } } as unknown as Request;
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValueOnce({ json: jsonMock });
    const res = { status: statusMock } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});