import { NextResponse } from "next/server";

export function apiJson(data: unknown, status = 200, headers?: HeadersInit) {
  return NextResponse.json(data, {
    status,
    headers,
  });
}

export function apiPaginated<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  status = 200,
  headers?: HeadersInit
) {
  return apiJson(
    {
      data,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    },
    status,
    headers
  );
}
