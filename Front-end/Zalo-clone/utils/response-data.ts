// Backend APIResponse structure
export interface APIResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: DataResponse<T> | null;
  errors?: ErrorDetail[];
  timestamp?: string;
}

export interface DataResponse<T> {
  items: T;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

// Front-end compatible interfaces
export interface SingleResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: DataResponse<T> | null;
  errors?: ErrorDetail[];
  timestamp?: string;
}

// For list responses (non-paginated)
export interface ListResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: DataResponse<T[]> | null;
  errors?: ErrorDetail[];
  timestamp?: string;
}

// For paginated responses (Spring Page<T>)
export interface PaginationResponse<T> {
  success: boolean;
  message: string;
  statusCode: number;
  data: DataResponse<PageData<T>> | null;
  errors?: ErrorDetail[];
  timestamp?: string;
}

export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // current page (0-indexed)
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

// Legacy support - keep for backward compatibility
export interface Items<T> {
  items: T;
}