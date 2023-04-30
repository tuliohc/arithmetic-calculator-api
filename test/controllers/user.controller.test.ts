import { Request, Response } from 'express';
import userController from '../../src/controllers/user.controller';
import { UserModel } from '../../src/models/user.model';

function createRequest(username: string, password: string): Request {
  return {
    body: { username, password },
  } as Request;
}

describe('User controller', () => {
  describe('signin', () => {
    it('should respond with a 200 status code for valid credentials', async () => {
      const req = createRequest('user@example.com', 'password123');
      const res = { json: jest.fn() } as unknown as Response;
      
      // create a stub for UserModel.findOne method
      const findOneStub = jest.spyOn(UserModel, 'findOne');
      findOneStub.mockResolvedValueOnce({
        id: '123',
        username: 'user@example.com',
        password: 'password123',
      });

      await userController.signin(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication successful' });
      
      // restore original method
      findOneStub.mockRestore();
    });

    it('should respond with a 401 status code for invalid credentials', async () => {
      const req = {
        body: { username: 'user@example.com', password: 'wrongpassword' },
      } as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;

      // create a stub for UserModel.findOne method
      const findOneStub = jest.spyOn(UserModel, 'findOne');
      findOneStub.mockResolvedValueOnce(null);

      await userController.signin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });

      // restore original method
      findOneStub.mockRestore();
    });

    it('should respond with a 500 status code for unexpected errors', async () => {
      const req = createRequest('user@example.com', 'password123');
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    
      // create a stub for UserModel.findOne method that throws an error
      const findOneStub = jest.spyOn(UserModel, 'findOne');
      findOneStub.mockRejectedValueOnce(new Error('An unexpected error occurred'));
    
      await userController.signin(req, res);
    
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    
      // restore original method
      findOneStub.mockRestore();
    });

  });
});