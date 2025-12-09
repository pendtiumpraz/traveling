import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

export function successResponse<T>(
  data: T,
  message?: string,
  meta?: ApiResponse["meta"],
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    meta,
  });
}

export function errorResponse(
  error: string,
  status = 400,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status },
  );
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number,
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

export function notFoundResponse(
  entity = "Resource",
): NextResponse<ApiResponse> {
  return errorResponse(`${entity} not found`, 404);
}

export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse("Unauthorized", 401);
}

export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse("Forbidden", 403);
}

export function validationErrorResponse(
  errors: Record<string, string[]>,
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: "Validation failed",
      data: errors,
    },
    { status: 422 },
  );
}
