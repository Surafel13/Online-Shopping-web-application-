import axios from "axios";
import type { ApiResponse } from "../types/api";

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  // Thunks reject with plain strings (rejectWithValue) - pass them through.
  if (typeof error === "string" && error) return error;

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse | undefined;
    // Prefer field-level validation messages over the generic "Validation failed".
    if (data?.errors?.length)
      return data.errors.map((e) => e.message).join(", ");
    if (data?.message) return data.message;
    if (error.code === "ECONNABORTED")
      return "The request timed out. Please try again.";
    if (!error.response)
      return "Network error. Check your connection and try again.";
    if (error.message) return error.message;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}

export function isAuthError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
