import { apiJson } from "@/lib/api-response";
import { buildOpenApiDocument } from "@/lib/openapi";

export const runtime = "nodejs";

export async function GET() {
  return apiJson(buildOpenApiDocument());
}
