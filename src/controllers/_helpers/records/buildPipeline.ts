export function buildPipeline(
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