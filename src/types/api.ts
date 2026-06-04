export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Helper to keep controllers terse + consistent
export const ok = <T>(data: T): ApiSuccess<T> => ({ data });
