export function buildSortOption(sort?: string) {
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