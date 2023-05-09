import Decimal from 'decimal.js';
import { Request, Response } from 'express';
import { calculate, operationController } from '../../src/controllers/operation.controller';
import { OperationModel, OperationType } from '../../src/models/operation.model';
import { RecordModel, UserModel } from '../../src/models';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

const mockUser = {
  _id: '123',
  balance: '100',
  save: jest.fn(),
};

function mockUserNotFound() {
  jest.spyOn(UserModel, 'findById').mockResolvedValue(null);
}

function mockUserFindError() {
  jest.spyOn(UserModel, 'findById').mockImplementation((id: any) => {
    throw new Error('Random Error');
  });
}

describe('Operation controller', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('calculate', () => {
    it('should perform addition operation', async () => {
      const result = await calculate(OperationType.ADDITION, ['2', '3']);
      expect(result).toEqual(new Decimal(5));
    });

    it('should perform subtraction operation', async () => {
      const result = await calculate(OperationType.SUBTRACTION, ['5', '3']);
      expect(result).toEqual(new Decimal(2));
    });

    it('should perform multiplication operation', async () => {
      const result = await calculate(OperationType.MULTIPLICATION, ['2', '3']);
      expect(result).toEqual(new Decimal(6));
    });

    it('should perform division operation', async () => {
      const result = await calculate(OperationType.DIVISION, ['6', '3']);
      expect(result).toEqual(new Decimal(2));
    });

    it('should perform square root operation', async () => {
      const result = await calculate(OperationType.SQUARE_ROOT, ['25']);
      expect(result).toEqual(new Decimal(5));
    });
  });

  describe('performOperation', () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;
    let status: jest.Mock;
    let json: jest.Mock;

    beforeEach(() => {
      req = { userId: mockUser._id, params: { type: OperationType.ADDITION }, body: { params: "[1, 2]" } };
      status = jest.fn().mockReturnThis();
      json = jest.fn().mockReturnThis();
      res = { status, json };

      jest.spyOn(UserModel, 'findById').mockImplementation();
      jest.spyOn(RecordModel, 'create').mockImplementation();
    });

    it('should perform an addition operation and return the result', async () => {
      jest.spyOn(UserModel, 'findById').mockResolvedValue({ _id: mockUser._id, balance: '100', save: jest.fn() });
      jest.spyOn(OperationModel, 'findOne').mockResolvedValue({ type: 'addition', cost: '1'});
      jest.spyOn(RecordModel, 'create').mockResolvedValue([]);
  
      await operationController.performOperation(req as AuthenticatedRequest, res as Response);
  
      expect(UserModel.findById).toHaveBeenCalledWith(mockUser._id);
      expect(RecordModel.create).toHaveBeenCalled();
      expect(json).toHaveBeenCalledWith({ result: '3', cost: '1', balance: '99' });
    });

    describe('error conditions', () => {
      it('should return a 400 error for invalid operation type', async () => {
        req.params = { type: 'INVALID_OPERATION_TYPE' };
        
        await operationController.performOperation(req as AuthenticatedRequest, res as Response);
      
        expect(status).toHaveBeenCalledWith(400);
        expect(json).toHaveBeenCalledWith({ error: 'Invalid operation type' });
      });
  
      it('should return a 404 error when the user is not found', async () => {
        mockUserNotFound();
      
        await operationController.performOperation(req as AuthenticatedRequest, res as Response);
      
        expect(status).toHaveBeenCalledWith(404);
        expect(json).toHaveBeenCalledWith({ error: 'User not found' });
      });

      it('should return a 403 error when the user does not have enough balance', async () => {
        const mockUser = {
          _id: 'mockUserId',
          balance: '0',
        };
      
        const req = {
          userId: mockUser._id,
          params: {
            type: OperationType.ADDITION,
          },
          body: {
            params: [2, 3],
          },
        } as unknown as Request;
      
        const res = {
          json: jest.fn(),
          status: jest.fn().mockReturnThis(),
        } as unknown as Response;
      
        jest.spyOn(UserModel, 'findById').mockResolvedValueOnce(mockUser);
        jest.spyOn(OperationModel, 'findOne').mockResolvedValue({ type: 'addition', cost: '1'});
      
        await operationController.performOperation(req, res);
      
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          error: 'Insufficient balance',
        });
      });
  
      it('should return 500 when an unexpected condition occurs', async () => {
        mockUserFindError();
  
        await operationController.performOperation(req as AuthenticatedRequest, res as Response);
  
        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
      });
    })
  });
    
});