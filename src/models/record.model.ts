import { Document, model, Schema } from 'mongoose';
import { Operation } from './operation.model';
import { User } from './user.model';

interface Record extends Document {
  operation: Operation['_id'];
  user: User['_id'];
  amount: string;
  userBalance: string;
  operationResponse: string;
  date: Date;
  deletedAt?: Date;
}

const RecordSchema = new Schema({
  operation: {
    type: Schema.Types.ObjectId,
    ref: 'Operation',
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  userBalance: {
    type: String,
    required: true,
  },
  operationResponse: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

RecordSchema.virtual('isDeleted').get(function () {
  return !!this.deletedAt;
});

const RecordModel = model<Record>('Record', RecordSchema);

export { Record, RecordModel };