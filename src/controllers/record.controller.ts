import { Request, Response } from 'express';
import { RecordModel } from '../models/record.model';

export const recordController = {
  async getRecords(req: Request, res: Response) {
    try {
      const { userId } = req as any;
      const records = await RecordModel.find({ user: userId });

      res.json(records);
    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },
};