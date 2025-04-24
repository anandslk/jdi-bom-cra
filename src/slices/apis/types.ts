import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ErrorResponse {
  message: string;
}

interface IErrorData {
  name: string;
  message: string;
  stack: string;
}

/**
 * Extracts an error message from an RTK Query error response.
 *
 * @param error - The error object from an API call.
 * @returns The extracted error message or a default message.
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "data" in error) {
    const fetchError = error as FetchBaseQueryError;

    if (
      typeof fetchError.data === "object" &&
      fetchError.data !== null &&
      "message" in fetchError.data
    ) {
      return (fetchError.data as ErrorResponse).message;
    }
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    console.error(error);
    return (error as IErrorData).message;
  }

  return "An unexpected error occurred.";
}

export interface ISigninRes {
  resultData: {
    user: {
      email: string;
      fullName: string;
      role: string;
    };
    token: string;
  };
}

export interface IBomArgs {
  parentPart: string;
  sourceOrg: string;
  plants: string[];
}

export interface IRDOORGRes {
  status: number;
  message: string;
  data: string[];
}

export interface ITask {
  id: string;
  parentPart: string;
  sourceOrg: string;
  plants: string[];
  status: "processing" | "failed" | "success";
}
