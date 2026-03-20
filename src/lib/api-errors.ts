import { NextResponse } from "next/server";

type ApiErrorOptions = {
  status: number;
  code: string;
  message: string;
  headers?: HeadersInit;
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly headers?: HeadersInit;

  constructor({ status, code, message, headers }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

export function badRequest(message = "Invalid request body", code = "bad_request") {
  return new ApiError({ status: 400, code, message });
}

export function unauthorized(message = "Authentication required", code = "unauthorized") {
  return new ApiError({ status: 401, code, message });
}

export function forbidden(message = "Forbidden", code = "forbidden") {
  return new ApiError({ status: 403, code, message });
}

export function notFound(message = "Resource not found", code = "not_found") {
  return new ApiError({ status: 404, code, message });
}

export function conflict(message = "Conflict", code = "conflict") {
  return new ApiError({ status: 409, code, message });
}

export function tooManyRequests(retryAfterSeconds: number, message = "Rate limit exceeded") {
  return new ApiError({
    status: 429,
    code: "rate_limited",
    message,
    headers: {
      "Retry-After": String(Math.max(1, retryAfterSeconds)),
    },
  });
}

export function internalServerError(message = "Internal server error", code = "internal_error") {
  return new ApiError({ status: 500, code, message });
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      {
        status: error.status,
        headers: error.headers,
      }
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: {
        code: "internal_error",
        message: "Internal server error",
      },
    },
    { status: 500 }
  );
}
