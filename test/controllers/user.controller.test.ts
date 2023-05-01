import { Request, Response } from 'express';
import userController from '../../src/controllers/user.controller';
import { UserModel } from '../../src/models/user.model';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

function createAuthRequest(username: string, password: string): Request {
  return {
    body: { username, password },
  } as Request;
}

function createResponse(): Partial<Response> {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    clearCookie: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

describe('User controller', () => {
  describe('signin', () => {
    let findOneStub: jest.SpyInstance;

    beforeEach(() => {
      // create a stub for UserModel.findOne method
      findOneStub = jest.spyOn(UserModel, 'findOne');
    });

    afterEach(() => {
      // restore original method
      findOneStub.mockRestore();
    });

    it('should respond with a 200 status code for valid credentials', async () => {
      const req = createAuthRequest('user@example.com', 'password123');
      const res = createResponse() as unknown as Response;
      
      findOneStub.mockResolvedValueOnce({
        id: '123',
        username: 'user@example.com',
        password: 'password123',
      });

      await userController.signin(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: expect.any(String) });
    });

    it('should respond with a 401 status code for invalid credentials', async () => {
      const req = createAuthRequest('user@example.com','wrongpassword')
      const res = createResponse() as unknown as Response;

      findOneStub.mockResolvedValueOnce(null);

      await userController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should respond with a 500 status code for unexpected errors', async () => {
      const req = createAuthRequest('user@example.com', 'password123');
      const res = createResponse() as unknown as Response;
    
      findOneStub.mockRejectedValueOnce(new Error('An unexpected error occurred'));
    
      await userController.signin(req, res);
    
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    });

  });

  describe('getUserBalance', () => {
    const mockUser = {
      id: 'mockUserId',
      balance: '100',
    };
    const req = {
      userId: 'mockUserId',
      params: { id: 'mockUserId' }
    } as unknown as AuthenticatedRequest;


    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return the user balance', async () => {
      const res = createResponse() as unknown as Response;
      jest.spyOn(UserModel, 'findById').mockResolvedValueOnce(mockUser);

      await userController.getUserBalance(req, res);

      expect(UserModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(res.json).toHaveBeenCalledWith({ balance: mockUser.balance });
    });

    it('should return 404 when user is not found', async () => {
      const res = createResponse() as unknown as Response;
      const findByIdSpy = jest.spyOn(UserModel, 'findById').mockResolvedValueOnce(null);
    
      await userController.getUserBalance(req, res);
    
      expect(findByIdSpy).toHaveBeenCalledWith(req.userId);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return 500 when an unexpected error occurs', async () => {
      const res = createResponse() as unknown as Response;
      jest.spyOn(UserModel, 'findById').mockRejectedValueOnce(new Error('An unexpected error occurred'));

      await userController.getUserBalance(req, res);

      expect(UserModel.findById).toHaveBeenCalledWith(req.userId);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    });
  });
});