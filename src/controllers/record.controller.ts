import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { RecordModel } from '../models';
import { buildMatchObject } from './_helpers/records/buildMatch';
import { buildSortOption } from './_helpers/records/buildSort';
import { buildPipeline } from './_helpers/records/buildPipeline';

export const recordController = {
  async getRecords(req: Request, res: Response) {
    try {
      const { userId } = req as any;
      const { page = 1, perPage = 10, sort, search } = req.query || {};

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const match = buildMatchObject(userObjectId, search as string);
      const sortOption = buildSortOption(sort as string);
      const pipeline = buildPipeline(match, sortOption, page as number, perPage as number);

      const records = await RecordModel.aggregate(pipeline);
      const totalCount = await RecordModel.countDocuments({ user: userObjectId });

      res.json({
        page: Number(page),
        perPage: Number(perPage),
        totalCount,
        data: records.map(({ operation, ...record }) => ({
          ...record,
          operationType: operation.type,
        })),
      });
    } catch (error) {
      // console.error(error);
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  },

  async deleteRecord(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Find the record by id and update the deletedAt field to the current time
      const deletedRecord = await RecordModel.findByIdAndUpdate(
        id,
        { deletedAt: Date.now() },
        { new: true }
      );

      // If the record is not found, return a 404 error
      if (!deletedRecord) {
        return res.status(404).json({ error: 'Record not found' });
      }

      // Return the timestamp of the deleted record 
      res.json({ date: deletedRecord.deletedAt });
    } catch (error) {
      res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
};
