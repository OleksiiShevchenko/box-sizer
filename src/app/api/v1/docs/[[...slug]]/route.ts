import { ApiReference } from "@scalar/nextjs-api-reference";

export const runtime = "nodejs";

export const GET = ApiReference({
  url: "/api/v1/openapi.json",
  theme: "bluePlanet",
  title: "Packwell.io Public API",
  pageTitle: "Packwell.io Public API",
  favicon: "/email/packwell-mark.svg",
  metaData: {
    title: "Packwell.io Public API",
  },
});
