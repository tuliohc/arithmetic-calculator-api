import { Request, Response } from 'express';
import { OperationModel, RecordModel } from '../models';

export const recordController = {
  async getRecords(req: Request, res: Response) {
    try {
      const { userId } = req as any;
      const { page = 1, perPage = 10, sort, search } = req.query || {};

      const query: Record<string, any> = { user: userId };

      // Apply search filter
      if (search) {
        const searchRegex = { $regex: new RegExp(search.toString(), 'i') };

        // Get matching operation IDs
        const matchingOperations = await OperationModel.find({ type: searchRegex }, '_id');
        const matchingOperationIds = matchingOperations.map(op => op._id);

        query.$or = [
          { operation: { $in: matchingOperationIds } },
          { userBalance: searchRegex },
          { operationResponse: searchRegex }
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
        .populate('operation')
        .sort(sortOption)
        .skip((Number(page) - 1) * Number(perPage))
        .limit(Number(perPage))
        .lean();
        
      const transformedRecords = records.map(({ __v, operation, ...record }) => ({
        ...record,
        operationType: operation.type,
      }));


      res.json({
        page: Number(page),
        perPage: Number(perPage),
        totalCount,
        data: transformedRecords,
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