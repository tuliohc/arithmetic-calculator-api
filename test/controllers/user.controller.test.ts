import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import userController from '../../src/controllers/user.controller';
import { UserModel } from '../../src/models/user.model';
import { environment } from '../../src/config/environment';


describe('User Controller', () => {
  const mockUserId = 'mockUserId';
  const mockUsername = 'mockUsername';
  const mockPassword = 'mockPassword';
  const mockToken = 'mockToken';
  const mockBalance = 100;

  describe('signin', () => {
    it('should sign in the user with valid credentials', async () => {
      const mockUser = {
        _id: mockUserId,
        username: mockUsername,
        password: mockPassword,
        balance: mockBalance
      };

      const mockRequest = {
        body: {
          username: mockUsername,
          password: mockPassword
        }
      } as unknown as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      } as unknown as Response;

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(mockUser);

      jest.spyOn(jwt, 'sign').mockResolvedValueOnce(mockToken);

      await userController.signin(mockRequest, mockResponse);

      expect(UserModel.findOne).toHaveBeenCalledWith({ username: mockUsername, password: mockPassword });
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Sign-in successful' });
    });



    it('should not sign in the user with invalid credentials', async () => {
      const mockRequest = {
        body: {
          username: mockUsername,
          password: 'wrong_password'
        }
      } as unknown as Request;

      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      jest.spyOn(UserModel, 'findOne').mockResolvedValueOnce(null);

      await userController.signin(mockRequest, mockResponse);

      expect(UserModel.findOne).toHaveBeenCalledWith({ username: mockUsername, password: 'wrong_password' });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('signout', () => {
    it('should sign out the user successfully', async () => {
      const mockRequest = {} as unknown as Request;
      const mockResponse = {
        json: jest.fn(),
        clearCookie: jest.fn()
      } as unknown as Response;

      await userController.signout(mockRequest, mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith('arithmeticCalculatorApp_jwtToken');
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Sign-out successful' });
    });
  });


  describe('checkAuth', () => {
    it('should return authenticated as true when given a valid token', async () => {
      const mockRequest = {
        cookies: {
          arithmeticCalculatorApp_jwtToken: mockToken
        }
      } as unknown as Request;
      const mockResponse = {
        json: jest.fn()
      } as unknown as Response;

      jest.spyOn(jwt, 'verify').mockReturnValueOnce({ userId: mockUserId, username: mockUsername });

      await userController.checkAuth(mockRequest, mockResponse);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, environment.JWT_SECRET);
      expect(mockResponse.json).toHaveBeenCalledWith({ authenticated: true });
    });

    it('should return authenticated as false when given an invalid token', async () => {
      const mockRequest = {
        cookies: {
          arithmeticCalculatorApp_jwtToken: mockToken
        }
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw new Error('Invalid token') });

      await userController.checkAuth(mockRequest, mockResponse);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, environment.JWT_SECRET);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ authenticated: false });
    });

    it('should return authenticated as false when the JWT token is missing from the cookies', async () => {
      const mockRequest = {
        cookies: {}
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      // Reset the jwt.verify mock before running this test case
      jest.spyOn(jwt, 'verify').mockReset();

      await userController.checkAuth(mockRequest, mockResponse);

      expect(jwt.verify).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ authenticated: false });
    });

    it('should return authenticated as false when the JWT_SECRET is missing or invalid', async () => {
      const originalJwtSecret = environment.JWT_SECRET;
      environment.JWT_SECRET = '';

      const mockRequest = {
        cookies: {
          arithmeticCalculatorApp_jwtToken: mockToken
        }
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      jest.spyOn(jwt, 'verify').mockImplementationOnce(() => { throw new Error('Invalid secret') });

      await userController.checkAuth(mockRequest, mockResponse);

      expect(jwt.verify).toHaveBeenCalledWith(mockToken, environment.JWT_SECRET);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ authenticated: false });

      environment.JWT_SECRET = originalJwtSecret;
    });
  });

  describe('getUserBalance', () => {
    it('should return the user balance when given a valid user ID', async () => {
      const mockUser = {
        _id: mockUserId,
        username: mockUsername,
        password: mockPassword,
        balance: mockBalance
      };

      const mockRequest = {
        userId: mockUserId
      } as unknown as Request;
      const mockResponse = {
        json: jest.fn()
      } as unknown as Response;

      jest.spyOn(UserModel, 'findById').mockResolvedValueOnce(mockUser);

      await userController.getUserBalance(mockRequest, mockResponse);

      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.json).toHaveBeenCalledWith({ balance: mockBalance });
    });

    it('should return an error message when the user is not found', async () => {
      const mockRequest = {
        userId: mockUserId
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      jest.spyOn(UserModel, 'findById').mockResolvedValueOnce(null);
      await userController.getUserBalance(mockRequest, mockResponse);

      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should return an error message when an unexpected error occurs', async () => {
      const mockRequest = {
        userId: mockUserId
      } as unknown as Request;
      const mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      jest.spyOn(UserModel, 'findById').mockRejectedValueOnce(new Error('Unexpected error'));

      await userController.getUserBalance(mockRequest, mockResponse);

      expect(UserModel.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    });
  });
});
