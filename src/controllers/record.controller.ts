import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { RecordModel } from '../models';

export const recordController = {
  async getRecords(req: Request, res: Response) {
    try {
      const { userId } = req as any;
      const { page = 1, perPage = 10, sort, search } = req.query || {};

      const userObjectId = new mongoose.Types.ObjectId(userId);
      const match = buildRecordsMatchObject(userObjectId, search as string);
      const sortOption = buildRecordsSortOption(sort as string);
      const pipeline = buildRecordsPipeline(match, sortOption, page as number, perPage as number);

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
      console.error(error);
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

function buildRecordsMatchObject(userObjectId: mongoose.Types.ObjectId, search?: string) {
  const formattedSearch = search ? search.toLowerCase().replace(/\s+/g, '_') : '';
  const regexSearch = new RegExp(formattedSearch, 'i');

  return {
    $and: [
      { user: userObjectId },
      {
        $or: [
          { 'operation.type': { $regex: regexSearch } },
          { userBalance: { $regex: regexSearch } },
          { operationResponse: { $regex: regexSearch } },
        ],
      },
    ],
  };
}

function buildRecordsSortOption(sort?: string) {
  let sortOption: { [key: string]: 1 | -1 } = { date: -1 };

  if (sort && typeof sort === 'string') {
    const parts = sort.split(':');
    if (parts.length === 2 && ['asc', 'desc'].includes(parts[1])) {
      const sortKey = parts[0] === 'operationType' ? 'operation.type' : parts[0];
      sortOption = { [sortKey]: parts[1] === 'asc' ? 1 : -1 };
    }
  }

  return sortOption;
}

function buildRecordsPipeline(
  match: Record<string, any>,
  sortOption: { [key: string]: 1 | -1 },
  page: number,
  perPage: number,
) {
  return [
    {
      $lookup: {
        from: 'operations',
        localField: 'operation',
        foreignField: '_id',
        as: 'operation',
      },
    },
    { $unwind: '$operation' },
    {
      $project: {
        user: 1,
        amount: 1,
        userBalance: 1,
        deletedAt: 1,
        operationResponse: 1,
        date: 1,
        'operation.type': 1,
      },
    },
    { $match: match },
    { $sort: sortOption },
    { $skip: (Number(page) - 1) * Number(perPage) },
    { $limit: Number(perPage) },
  ];
}