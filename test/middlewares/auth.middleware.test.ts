import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { environment } from '../../src/config/environment';
import { requireAuth } from '../../src/middlewares/auth.middleware';

interface AuthRequest extends Request {
  userId?: string;
}

describe('requireAuth Middleware', () => {
  const secret = environment.JWT_SECRET || 'secret';
  const token = jwt.sign({ userId: '123' }, secret);

  it('should set the userId on the request object when given a valid token', () => {
    const req = { cookies: { arithmeticCalculatorApp_jwtToken: token } } as unknown as AuthRequest;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(req.userId).toEqual('123');
    expect(next).toHaveBeenCalled();
  });

  it('should return a 401 error when not given a token', () => {
    const req = { cookies: {} } as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    const next = jest.fn() as NextFunction;

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied. No token provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return a 401 error when given an invalid token', () => {
    const req = { cookies: { arithmeticCalculatorApp_jwtToken: 'invalid-token' } } as unknown as Request;
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
