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