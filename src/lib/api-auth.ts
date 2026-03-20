import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { unauthorized } from "@/lib/api-errors";

const TOKEN_TTL_SECONDS = 60 * 60;

function getApiJwtSecret() {
  const secret = process.env.API_JWT_SECRET;
  if (!secret) {
    throw new Error("API_JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export function hashApiToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function signApiToken(userId: string, appId: string) {
  const issuedAtSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = new Date((issuedAtSeconds + TOKEN_TTL_SECONDS) * 1000);

  const token = await new SignJWT({ appId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt(issuedAtSeconds)
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .setJti(appId)
    .sign(getApiJwtSecret());

  return {
    token,
    expiresAt,
    expiresIn: TOKEN_TTL_SECONDS,
  };
}

export async function verifyApiToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getApiJwtSecret());

    const userId = typeof payload.sub === "string" ? payload.sub : null;
    const appId = typeof payload.appId === "string" ? payload.appId : null;
    const exp = typeof payload.exp === "number" ? payload.exp : null;

    if (!userId || !appId || !exp) {
      throw unauthorized("Invalid API token", "invalid_token");
    }

    return {
      userId,
      appId,
      expiresAt: new Date(exp * 1000),
    };
  } catch (error) {
    if (error instanceof Error && error.name === "ApiError") {
      throw error;
    }

    throw unauthorized("Invalid or expired API token", "invalid_token");
  }
}
