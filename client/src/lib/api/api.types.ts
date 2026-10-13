export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

export type Id = string;

export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}
