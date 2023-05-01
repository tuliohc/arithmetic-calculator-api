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
      const req = { userId: fakeUserId } as unknown as Request;
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;

      const mockRecords = [
        { _id: '1', user: fakeUserId, operationType: 'addition', params: [1, 2], result: '3' },
        { _id: '2', user: fakeUserId, operationType: 'subtraction', params: [5, 3], result: '2' },
      ];

      (RecordModel.find as jest.Mock).mockResolvedValueOnce(mockRecords);

      await recordController.getRecords(req, res);

      expect(RecordModel.find).toHaveBeenCalledWith({ user: fakeUserId });
      expect(res.json).toHaveBeenCalledWith(mockRecords);
    });

  });
});