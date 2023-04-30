import { Document, model, Schema } from "mongoose";

export interface User extends Document {
  username: string;
  password: string;
  status: string;
  balance: string;
}

export const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  balance: {  type: String, required: true, default: '0' }
});

export const UserModel = model<User>('User', UserSchema);