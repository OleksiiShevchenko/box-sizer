export function normalizeAppUrl(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
}

export function getConfiguredAppUrl(): string {
  return (
    normalizeAppUrl(process.env.NEXTAUTH_URL) ??
    normalizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeAppUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeAppUrl(process.env.VERCEL_URL) ??
    "http://localhost:3000"
  );
}
