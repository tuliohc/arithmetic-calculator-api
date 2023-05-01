import Decimal from 'decimal.js';
import { Request, Response } from 'express';
import { calculate, operationController } from '../../src/controllers/operation.controller';
import { OperationType } from '../../src/models/operation.model';
import { RecordModel } from '../../src/models/record.model';
import { UserModel } from '../../src/models/user.model';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

function mockUserWithBalance(balance: string) {
  jest.spyOn(UserModel, 'findById').mockResolvedValue({ _id: '123', balance, save: jest.fn() });
}

function mockUserNotFound() {
  jest.spyOn(UserModel, 'findById').mockResolvedValue(null);
}

function mockUserFindError() {
  jest.spyOn(UserModel, 'findById').mockImplementation(() => {
    throw new Error('Random Error');
  });
}

describe('Operation controller', () => {
  describe('calculate', () => {
    it('should perform addition operation', () => {
      const result = calculate(OperationType.ADDITION, ['2', '3']);
      expect(result).toEqual(new Decimal(5));
    });

    it('should perform subtraction operation', () => {
      const result = calculate(OperationType.SUBTRACTION, ['5', '3']);
      expect(result).toEqual(new Decimal(2));
    });

    it('should perform multiplication operation', () => {
      const result = calculate(OperationType.MULTIPLICATION, ['2', '3']);
      expect(result).toEqual(new Decimal(6));
    });

    it('should perform division operation', () => {
      const result = calculate(OperationType.DIVISION, ['6', '3']);
      expect(result).toEqual(new Decimal(2));
    });

    it('should perform square root operation', () => {
      const result = calculate(OperationType.SQUARE_ROOT, ['25']);
      expect(result).toEqual(new Decimal(5));
    });
  });

  describe('performOperation', () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;
    let status: jest.Mock;
    let json: jest.Mock;

    beforeEach(() => {
      req = { userId: '123', params: { type: OperationType.ADDITION }, body: { params: [1, 2] } };
      status = jest.fn().mockReturnThis();
      json = jest.fn().mockReturnThis();
      res = { status, json };

      jest.spyOn(UserModel, 'findById').mockImplementation();
      jest.spyOn(RecordModel, 'create').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should perform an addition operation and return the result', async () => {
      mockUserWithBalance('100')
      jest.spyOn(RecordModel, 'create').mockResolvedValue(undefined);
  
      await operationController.performOperation(req as AuthenticatedRequest, res as Response);
  
      expect(UserModel.findById).toHaveBeenCalledWith('123');
      expect(RecordModel.create).toHaveBeenCalled();
      expect(json).toHaveBeenCalledWith({ result: '3', balance: '99' });
    });

    describe('error conditions', () => {
      it('should return a 400 error for invalid operation type', async () => {
        req.params.type = 'INVALID_OPERATION_TYPE';
        
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
  
      it('should return 500 when an unexpected condition occurs', async () => {
        mockUserFindError();
  
        await operationController.performOperation(req as AuthenticatedRequest, res as Response);
  
        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
      });
    })
  });
    
});