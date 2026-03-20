import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/api-rate-limit";
import { hashApiToken, signApiToken } from "@/lib/api-auth";
import { apiErrorResponse, ApiError, badRequest } from "@/lib/api-errors";
import { apiJson } from "@/lib/api-response";
import { oauthTokenRequestSchema } from "@/lib/api-schemas";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function parseTokenRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return oauthTokenRequestSchema.safeParse({
      client_id: formData.get("client_id"),
      client_secret: formData.get("client_secret"),
    });
  }

  const body = await request.json().catch(() => null);
  return oauthTokenRequestSchema.safeParse(body);
}

export async function POST(request: Request) {
  try {
    const parsed = await parseTokenRequest(request);
    if (!parsed.success) {
      throw badRequest(parsed.error.issues[0]?.message ?? "Invalid OAuth token request");
    }

    const rateLimit = checkRateLimit(`oauth:${parsed.data.client_id}`, 10, 60_000);
    if (!rateLimit.allowed) {
      throw new ApiError({
        status: 429,
        code: "rate_limited",
        message: "Too many token requests",
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.retryAfterMs ?? 1000) / 1000)),
        },
      });
    }

    const app = await prisma.apiApp.findUnique({
      where: {
        clientId: parsed.data.client_id,
      },
    });

    if (!app) {
      throw new ApiError({
        status: 401,
        code: "invalid_client",
        message: "Invalid client credentials",
      });
    }

    const isValid = await bcrypt.compare(parsed.data.client_secret, app.clientSecretHash);
    if (!isValid) {
      throw new ApiError({
        status: 401,
        code: "invalid_client",
        message: "Invalid client credentials",
      });
    }

    const signedToken = await signApiToken(app.userId, app.id);

    await prisma.apiToken.create({
      data: {
        appId: app.id,
        userId: app.userId,
        tokenHash: hashApiToken(signedToken.token),
        expiresAt: signedToken.expiresAt,
      },
    });

    return apiJson({
      access_token: signedToken.token,
      token_type: "Bearer",
      expires_in: signedToken.expiresIn,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
