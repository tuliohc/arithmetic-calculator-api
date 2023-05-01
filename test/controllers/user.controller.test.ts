import { Request, Response } from 'express';
import userController from '../../src/controllers/user.controller';
import { UserModel } from '../../src/models/user.model';

function createRequest(username: string, password: string): Request {
  return {
    body: { username, password },
  } as Request;
}

function createResponse(): Partial<Response> {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    clearCookie: jest.fn(),
  };
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
      const req = createRequest('user@example.com', 'password123');
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
      const req = createRequest('user@example.com','wrongpassword')
      const res = createResponse() as unknown as Response;

      findOneStub.mockResolvedValueOnce(null);

      await userController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should respond with a 500 status code for unexpected errors', async () => {
      const req = createRequest('user@example.com', 'password123');
      const res = createResponse() as unknown as Response;
    
      findOneStub.mockRejectedValueOnce(new Error('An unexpected error occurred'));
    
      await userController.signin(req, res);
    
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    });

  });

  describe('logout', () => {
    it('should clear the token cookie and return a success message', () => {
      const req = { headers: { authorization: 'Bearer valid-token' } } as Request;
      const res = createResponse() as unknown as Response;

      userController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('token');
      expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
    });
  });
});