import Decimal from 'decimal.js';
import { Request, Response } from 'express';
import { RecordModel } from '../models/record.model';
import { UserModel } from '../models/user.model';
import { OperationType, OperationCosts } from '../models/operation.model';

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

      // Get the operation cost
      const cost = new Decimal(OperationCosts[type as OperationType]);

      // Check if the user has enough balance
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const balance = new Decimal(user.balance);
      if (balance.lt(cost)) {
        return res.status(403).json({ error: 'Insufficient balance' });
      }

      // Perform the operation and update the user balance
      const operationResult = calculate(type as OperationType, params);
      user.balance = balance.minus(cost).toString();
      await user.save();

      // Log the operation and return the result
      await RecordModel.create({
        user,
        type,
        cost: cost.toString(),
        result: operationResult.toString(),
      });
      res.json({
        result: operationResult.toString(),
        balance: user.balance,
      });
    } catch (error) {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },
};

export function calculate(type: OperationType, params: any[]) {
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
      return null //TODO:  https://www.random.org/
    default:
      throw new Error('Invalid operation type');
  }
}