import { Document, model, Schema } from "mongoose";
import Decimal from 'decimal.js';

enum OperationType {
  ADDITION = 'addition',
  SUBTRACTION = 'subtraction',
  MULTIPLICATION = 'multiplication',
  DIVISION = 'division',
  SQUARE_ROOT = 'square_root',
  RANDOM_STRING = 'random_string',
}

interface OperationCosts {
  [OperationType.ADDITION]: string;
  [OperationType.SUBTRACTION]: string;
  [OperationType.MULTIPLICATION]: string;
  [OperationType.DIVISION]: string;
  [OperationType.SQUARE_ROOT]: string;
  [OperationType.RANDOM_STRING]: string;
}

// TODO: move this values to the database
export const OperationCosts: OperationCosts = {
  [OperationType.ADDITION]: '1',
  [OperationType.SUBTRACTION]: '1',
  [OperationType.MULTIPLICATION]: '2',
  [OperationType.DIVISION]: '2',
  [OperationType.SQUARE_ROOT]: '3',
  [OperationType.RANDOM_STRING]: '1',
};

interface Operation extends Document {
  type: OperationType;
  cost: string;
}

const OperationSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(OperationType),
    required: true,
  },
  cost: {
    type: String,
    required: true,
    get: (value: string) => new Decimal(value),
    set: (value: Decimal) => value.toString(),
  },
});

const OperationModel = model<Operation>('Operation', OperationSchema);

export { Operation, OperationModel, OperationType };