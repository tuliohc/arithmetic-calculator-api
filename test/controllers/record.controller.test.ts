import { Request, Response } from 'express';
import { recordController } from '../../src/controllers/record.controller';
import { RecordModel } from '../../src/models/record.model';

jest.mock('../../src/models/record.model');

const fakeUserId = '123'

describe('Record controller', () => {
  describe('getRecords', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return an array of records', async () => {
      const req = { userId: fakeUserId, query: {} } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;

      const mockRecords = [
        { _id: '1', user: fakeUserId, operationType: 'addition', params: [1, 2], result: '3' },
        { _id: '2', user: fakeUserId, operationType: 'subtraction', params: [5, 3], result: '2' },
      ];

      (RecordModel.countDocuments as jest.Mock).mockResolvedValueOnce(2);
      (RecordModel.find as jest.Mock).mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce(mockRecords),
      });

      await recordController.getRecords(req, res);

      expect(RecordModel.countDocuments).toHaveBeenCalledWith({ user: fakeUserId });
      expect(RecordModel.find).toHaveBeenCalledWith({ user: fakeUserId });
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        totalCount: 2,
        data: mockRecords,
      });
    });

    it('should return an error when an unexpected error occurs', async () => {
      const req = { userId: fakeUserId } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;

      jest.spyOn(RecordModel, 'find').mockImplementation(() => {
        throw new Error('Random Error');
      });
    
      await recordController.getRecords(req, res);
    
      expect(RecordModel.find).toHaveBeenCalledWith({ user: fakeUserId });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    });

    it('should return an empty array if no records are found for the user', async () => {
      const req = { userId: fakeUserId, query: {} } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;
    
      (RecordModel.countDocuments as jest.Mock).mockResolvedValueOnce(0);
      (RecordModel.find as jest.Mock).mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce([]),
      });
    
      await recordController.getRecords(req, res);
    
      expect(RecordModel.countDocuments).toHaveBeenCalledWith({ user: fakeUserId });
      expect(RecordModel.find).toHaveBeenCalledWith({ user: fakeUserId });
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        totalCount: 0,
        data: [],
      });
    });

    it('should apply the search filter when the "search" query parameter is present', async () => {
      const req = {
        userId: fakeUserId,
        query: {
          search: 'add',
        },
      } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;
    
      const mockRecords = [
        { _id: '1', user: fakeUserId, operationType: 'addition', params: [1, 2], result: '3' },
        { _id: '2', user: fakeUserId, operationType: 'subtraction', params: [5, 3], result: '2' },
      ];
    
      (RecordModel.countDocuments as jest.Mock).mockResolvedValueOnce(2);
      (RecordModel.find as jest.Mock).mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValueOnce(mockRecords),
      });
    
      await recordController.getRecords(req, res);
    
      expect(RecordModel.countDocuments).toHaveBeenCalledWith({
        user: fakeUserId,
        $or: [
          { operationType: { $regex: /add/i } },
          { params: { $elemMatch: { $regex: /add/i } } },
          { result: { $regex: /add/i } },
        ],
      });
      expect(RecordModel.find).toHaveBeenCalledWith({
        user: fakeUserId,
        $or: [
          { operationType: { $regex: /add/i } },
          { params: { $elemMatch: { $regex: /add/i } } },
          { result: { $regex: /add/i } },
        ],
      });
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        totalCount: 2,
        data: mockRecords,
      });
    });

    it('should apply the sort option when the "sort" query parameter is present', async () => {
      jest.resetAllMocks();      
      const req = {
        userId: fakeUserId,
        query: {
          sort: 'operationType:asc',
        },
      } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;
    
      const mockRecords = [];
    
      (RecordModel.countDocuments as jest.Mock).mockResolvedValueOnce(0);
      const findMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnValueOnce(mockRecords),
        exec: jest.fn().mockResolvedValueOnce(mockRecords),
      };
      (RecordModel.find as jest.Mock).mockReturnValueOnce(findMock);
    
      await recordController.getRecords(req, res);
    
      expect(RecordModel.countDocuments).toHaveBeenCalledWith({
        user: fakeUserId,
      });
      expect(RecordModel.find).toHaveBeenCalledWith({
        user: fakeUserId,
      });
    
      expect(findMock.sort).toHaveBeenCalledWith({
        operationType: 1,
      });
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        totalCount: 0,
        data: [],
      });
    });

  });

  describe('deleteRecord', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('should soft delete a record', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = { json: jest.fn() } as unknown as Response;
  
      const deleteDate = Date.now()
      const deletedRecord = { _id: '1', deletedAt: deleteDate };
      (RecordModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(deletedRecord);
  
      await recordController.deleteRecord(req, res);
  
      expect(RecordModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { deletedAt: expect.any(Number) },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith({ date: deletedRecord.deletedAt });
    });

  });
});