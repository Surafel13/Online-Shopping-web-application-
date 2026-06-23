import axios from 'axios';
import type { ApiResponse } from '../types/api';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;
    if (data?.message) return data.message;
    if (data?.errors?.length) return data.errors.map((e) => e.message).join(', ');
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
