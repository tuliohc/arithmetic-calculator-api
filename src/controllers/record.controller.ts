import { Request, Response } from 'express';
import { RecordModel } from '../models/record.model';

export const recordController = {
  async getRecords(req: Request, res: Response) {
    try {
      const { userId } = req as any;
      const { page = 1, perPage = 10, sort, search } = req.query || {};

      const query: Record<string, any> = { user: userId };

      // Apply search filter
      if (search) {
        query.$or = [
          { operationType: { $regex: new RegExp(search.toString(), 'i') } },
          { params: { $elemMatch: { $regex: new RegExp(search.toString(), 'i') } } },
          { result: { $regex: new RegExp(search.toString(), 'i') } },
        ];
      }

      const totalCount = await RecordModel.countDocuments(query);

      // Apply sort
      let sortOption: { [key: string]: 1 | -1 } = { createdAt: -1 };

      if (sort && typeof sort === 'string') {
        const parts = sort.split(':');
        if (parts.length === 2 && ['asc', 'desc'].includes(parts[1])) {
          sortOption = { [parts[0]]: parts[1] === 'asc' ? 1 : -1 };
        }
      }

      const records = await RecordModel.find(query)
        .sort(sortOption)
        .skip((Number(page) - 1) * Number(perPage))
        .limit(Number(perPage));

      res.json({
        page: Number(page),
        perPage: Number(perPage),
        totalCount,
        data: records,
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