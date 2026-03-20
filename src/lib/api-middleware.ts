import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashApiToken, verifyApiToken } from "@/lib/api-auth";
import { apiErrorResponse, unauthorized, tooManyRequests } from "@/lib/api-errors";
import { checkRateLimit } from "@/lib/api-rate-limit";

type RouteContext = Record<string, unknown>;

export type ApiRequestContext = {
  userId: string;
  appId: string;
  tokenHash: string;
};

type ApiRouteHandler<TContext extends RouteContext = RouteContext> = (
  request: NextRequest,
  context: TContext & { api: ApiRequestContext }
) => Promise<Response> | Response;

export function withApiAuth<TContext extends RouteContext>(handler: ApiRouteHandler<TContext>) {
  return async (request: NextRequest, context: TContext) => {
    try {
      const authorization = request.headers.get("authorization");
      const bearerPrefix = "Bearer ";

      if (!authorization?.startsWith(bearerPrefix)) {
        throw unauthorized("Missing Bearer token", "missing_token");
      }

      const token = authorization.slice(bearerPrefix.length).trim();
      if (!token) {
        throw unauthorized("Missing Bearer token", "missing_token");
      }

      const verified = await verifyApiToken(token);
      const tokenHash = hashApiToken(token);
      const tokenRecord = await prisma.apiToken.findUnique({
        where: { tokenHash },
      });

      if (
        !tokenRecord ||
        tokenRecord.userId !== verified.userId ||
        tokenRecord.appId !== verified.appId ||
        tokenRecord.expiresAt.getTime() <= Date.now()
      ) {
        throw unauthorized("Invalid or expired API token", "invalid_token");
      }

      return await handler(request, {
        ...context,
        api: {
          userId: verified.userId,
          appId: verified.appId,
          tokenHash,
        },
      });
    } catch (error) {
      return apiErrorResponse(error);
    }
  };
}

export function withRateLimit<TContext extends RouteContext>(
  handler: ApiRouteHandler<TContext>,
  options?: {
    limit?: number;
    windowMs?: number;
  }
) {
  return async (request: NextRequest, context: TContext & { api: ApiRequestContext }) => {
    try {
      const result = checkRateLimit(
        context.api.appId,
        options?.limit,
        options?.windowMs
      );

      if (!result.allowed) {
        throw tooManyRequests(Math.ceil((result.retryAfterMs ?? 1000) / 1000));
      }

      return await handler(request, context);
    } catch (error) {
      return apiErrorResponse(error);
    }
  };
}

export function withApi<TContext extends RouteContext>(
  handler: ApiRouteHandler<TContext>,
  options?: {
    limit?: number;
    windowMs?: number;
  }
) {
  return withApiAuth(
    withRateLimit(handler, {
      limit: options?.limit,
      windowMs: options?.windowMs,
    })
  );
}
