import type { PaginationParams } from "../shared";

export const getPaginationParams = (query: any): PaginationParams => {
  return {
    page: query.page ? parseInt(query.page, 10) : 1,
    limit: query.limit ? parseInt(query.limit, 10) : 10,
    sortBy: query.sortBy || "createdAt",
    sortOrder: query.sortOrder === "asc" ? "asc" : "desc",
  };
};
