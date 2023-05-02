import Decimal from 'decimal.js';
import axios from 'axios';
import { Request, Response } from 'express';
import { RecordModel } from '../models/record.model';
import { UserModel } from '../models/user.model';
import { OperationModel, OperationType } from '../models/operation.model';

export const operationController = {
  async performOperation(req: Request, res: Response) {
    try {
      const { userId } = req as any;
      const { type } = req.params;
      const { params } = req.body;

      // Check if the operation type is valid
      if (!Object.values(OperationType).includes(type as OperationType)) {
        return res.status(400).json({ error: 'Invalid operation type' });
      }

      // Check if the user has enough balance
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get the operation cost
      const operation = await OperationModel.findOne({ type: type });
      const cost = new Decimal(operation.cost);


      const balance = new Decimal(user.balance);
      if (balance.lt(cost)) {
        return res.status(403).json({ error: 'Insufficient balance' });
      }

      let parsedParams;
      if (type === OperationType.RANDOM_STRING) {
        // Set default empty array for params if not provided
        parsedParams = params || [];
      } else {
        parsedParams = JSON.parse(params);
      }


      // Perform the operation and update the user balance
      const operationResult = await calculate(type as OperationType, parsedParams);
      user.balance = balance.minus(cost).toString();
      await user.save();

      // Log the operation and return the result
      await RecordModel.create({
        operation: operation._id,
        user: user._id,
        amount: cost.toString(),
        userBalance: balance,
        operationResponse: operationResult.toString(),
      });
      res.json({
        result: operationResult.toString(),
        balance: user.balance,
      });
    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },
};

export async function calculate(type: OperationType, params: any[]) {
  if (!Array.isArray(params)) {
    throw new Error('Invalid parameters');
  }

  switch (type) {
    case OperationType.ADDITION:
      return new Decimal(params.reduce((a, b) => new Decimal(a).plus(b)).toString());
    case OperationType.SUBTRACTION:
      return new Decimal(params.reduce((a, b) => new Decimal(a).minus(b)).toString());
    case OperationType.MULTIPLICATION:
      return new Decimal(params.reduce((a, b) => new Decimal(a).times(b)).toString());
    case OperationType.DIVISION:
      return new Decimal(params.reduce((a, b) => new Decimal(a).dividedBy(b)).toString());
    case OperationType.SQUARE_ROOT:
      return new Decimal(params[0]).squareRoot();
    case OperationType.RANDOM_STRING:
      return await requestRandomString()
    default:
      throw new Error('Invalid operation type');
  }
}

async function requestRandomString() {
  const response = await axios.get('https://www.random.org/strings/', {
    params: {
      num: 1,
      len: 8,
      digits: 'on',
      upperalpha: 'on',
      loweralpha: 'on',
      unique: 'on',
      format: 'plain',
    },
  });

  return response.data.trim();
}