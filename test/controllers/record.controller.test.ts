import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { recordController } from '../../src/controllers/record.controller';
import { RecordModel } from '../../src/models/record.model';
import { buildMatchObject } from '../../src/controllers/_helpers/records/buildMatch';
import { buildSortOption } from '../../src/controllers/_helpers/records/buildSort';
import { buildPipeline } from '../../src/controllers/_helpers/records/buildPipeline';

jest.mock('../../src/models/record.model');

// mock 12 bytes ObjectId
const fakeUserId = '6450f05115b430b0ec783a98'

describe('Record controller', () => {
  describe('getRecords', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return an array of records', async () => {
      const req = { userId: fakeUserId, query: {} } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;
    
      const mockedIds = [
        '611033b5c0fc5a5b5a3f3561', 
        '611033b5c0fc5a5b5a3f3562'
      ]

      const mockRecords = [
        { _id: mockedIds[0], operation: { type: 'addition' }, params: [1, 2], result: '3' },
        { _id: mockedIds[1], operation: { type: 'subtraction' }, params: [5, 3], result: '2' },
      ];
    
      (RecordModel.aggregate as jest.Mock).mockResolvedValueOnce(mockRecords);
      (RecordModel.countDocuments as jest.Mock).mockResolvedValueOnce(2);
    
      await recordController.getRecords(req, res);
    
      expect(RecordModel.aggregate).toHaveBeenCalledTimes(1);
      expect(RecordModel.countDocuments).toHaveBeenCalledWith({ user: expect.any(mongoose.Types.ObjectId) });
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        totalCount: 2,
        data: [
          { _id: mockedIds[0], operationType: 'addition', params: [1, 2], result: '3' },
          { _id: mockedIds[1], operationType: 'subtraction', params: [5, 3], result: '2' },
        ],
      });
    });
    
    it('should return an error when an unexpected error occurs', async () => {
      const req = { userId: fakeUserId } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as any;

      jest.spyOn(RecordModel, 'aggregate').mockImplementation(() => {
        throw new Error('Random Error');
      });
    
      await recordController.getRecords(req, res);
    
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    });

    it('should return an empty array if no records are found for the user', async () => {
      const req = { userId: fakeUserId, query: {} } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;
    
      (RecordModel.aggregate as jest.Mock).mockResolvedValueOnce([]);
      (RecordModel.countDocuments as jest.Mock).mockResolvedValueOnce(0);
    
      await recordController.getRecords(req, res);
    
      expect(RecordModel.countDocuments).toHaveBeenCalledWith({ user: expect.any(mongoose.Types.ObjectId) });
      expect(RecordModel.aggregate).toHaveBeenCalledTimes(1);
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
        { _id: '1', user: fakeUserId, operation: { type: 'addition' }, params: [1, 2], result: '3' },
        { _id: '2', user: fakeUserId, operation: { type: 'subtraction' }, params: [5, 3], result: '2' },
      ];
    
      const userObjectId = new mongoose.Types.ObjectId(fakeUserId);
      const match = buildMatchObject(userObjectId, 'add');
      const sortOption = buildSortOption(undefined);
      const pipeline = buildPipeline(match, sortOption, 1, 10);
    
      (RecordModel.aggregate as jest.Mock).mockResolvedValueOnce(mockRecords);
      (RecordModel.countDocuments as jest.Mock).mockResolvedValueOnce(mockRecords.length);
    
      await recordController.getRecords(req, res);
    
      expect(RecordModel.aggregate).toHaveBeenCalledWith(pipeline);
      expect(RecordModel.countDocuments).toHaveBeenCalledWith({ user: expect.any(mongoose.Types.ObjectId) });
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        totalCount: mockRecords.length,
        data: mockRecords.map(({ operation, ...record }) => ({
          ...record,
          operationType: operation.type,
        })),
      });
    });

    it('should return a 500 status code and an error message when an unexpected error occurs', async () => {
      const req = {
        userId: fakeUserId,
        query: {},
      } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;
    
      const mockError = new Error('Unexpected error occurred');
      (RecordModel.aggregate as jest.Mock).mockRejectedValueOnce(mockError);
    
      await recordController.getRecords(req, res);
    
      expect(RecordModel.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    });

    it('should apply the sort option when the "sort" query parameter is present', async () => {
      const req = {
        userId: fakeUserId,
        query: {
          sort: 'operationType:asc',
        },
      } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;
    
      const mockRecords = [
        { _id: '1', user: fakeUserId, operation: { type: 'addition' }, params: [1, 2], result: '3' },
        { _id: '2', user: fakeUserId, operation: { type: 'subtraction' }, params: [5, 3], result: '2' },
      ];
    
      const userObjectId = new mongoose.Types.ObjectId(fakeUserId);
      const match = buildMatchObject(userObjectId, '');
      const sortOption = buildSortOption('operationType:asc');
      const pipeline = buildPipeline(match, sortOption, 1, 10);
    
      (RecordModel.aggregate as jest.Mock).mockResolvedValueOnce(mockRecords);
      (RecordModel.countDocuments as jest.Mock).mockResolvedValueOnce(mockRecords.length);

      await recordController.getRecords(req, res);
    
      expect(RecordModel.aggregate).toHaveBeenCalledWith(pipeline);
      expect(RecordModel.countDocuments).toHaveBeenCalledWith({ user: expect.any(mongoose.Types.ObjectId) });
      expect(res.json).toHaveBeenCalledWith({
        page: 1,
        perPage: 10,
        totalCount: mockRecords.length,
        data: mockRecords.map(({ operation, ...record }) => ({
          ...record,
          operationType: operation.type,
        })),
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

    it('should return a 404 error when the record is not found', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
  
      (RecordModel.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce(null);
  
      await recordController.deleteRecord(req, res);
  
      expect(RecordModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { deletedAt: expect.any(Number) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Record not found' });
    });

    it('should return a 500 error when an unexpected error occurs', async () => {
      const req = { params: { id: '1' } } as unknown as Request;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
  
      jest.spyOn(RecordModel, 'findByIdAndUpdate').mockImplementation(() => {
        throw new Error('Random Error');
      });
  
      await recordController.deleteRecord(req, res);
  
      expect(RecordModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        { deletedAt: expect.any(Number) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'An unexpected error occurred' });
    });

  });
});