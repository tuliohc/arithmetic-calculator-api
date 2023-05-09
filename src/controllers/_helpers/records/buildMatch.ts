import mongoose from "mongoose";

export function buildMatchObject(userObjectId: mongoose.Types.ObjectId, search?: string) {
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