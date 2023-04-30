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

  });
});