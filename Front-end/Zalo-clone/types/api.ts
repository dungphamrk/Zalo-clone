/**
 * Common API types
 * @deprecated Use types from utils/response-data.ts and services/error.service.ts instead
 * This file is kept for backward compatibility
 */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}


