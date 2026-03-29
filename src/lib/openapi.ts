import { z } from "zod/v4";
import { createDocument } from "zod-openapi";
import {
  apiErrorSchema,
  boxBodySchema,
  boxListResponseSchema,
  boxResponseSchema,
  calculatePackingPlanBodySchema,
  deleteResponseSchema,
  oauthTokenRequestSchema,
  oauthTokenResponseSchema,
  paginationQuerySchema,
  publicIdSchema,
  packingPlanListResponseSchema,
  packingPlanResponseSchema,
  packingPlanCalculationResponseSchema,
  packingPlanUpdateBodySchema,
  packingPlanUpdateResponseSchema,
} from "@/lib/api-schemas";

const idPathSchema = publicIdSchema.meta({
  description: "Public resource identifier",
});

export function buildOpenApiDocument() {
  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "Packwell.io Public API",
      version: "1.0.0",
      description: "OAuth-protected API for boxes, packing plans, and packing calculations.",
    },
    components: {
      securitySchemes: {
        OAuth2ClientCredentials: {
          type: "oauth2",
          flows: {
            clientCredentials: {
              tokenUrl: "/api/v1/oauth/token",
              scopes: {},
            },
          },
        },
      },
    },
    paths: {
      "/api/v1/oauth/token": {
        post: {
          security: [],
          summary: "Create an access token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: oauthTokenRequestSchema,
              },
              "application/x-www-form-urlencoded": {
                schema: oauthTokenRequestSchema,
              },
            },
          },
          responses: {
            "200": {
              description: "OAuth token response",
              content: {
                "application/json": {
                  schema: oauthTokenResponseSchema,
                },
              },
            },
            "401": {
              description: "Invalid client credentials",
              content: {
                "application/json": {
                  schema: apiErrorSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/boxes": {
        get: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "List boxes",
          requestParams: {
            query: paginationQuerySchema,
          },
          responses: {
            "200": {
              description: "Paginated boxes list",
              content: {
                "application/json": {
                  schema: boxListResponseSchema,
                },
              },
            },
          },
        },
        post: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Create a box",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: boxBodySchema,
              },
            },
          },
          responses: {
            "201": {
              description: "Box created",
              content: {
                "application/json": {
                  schema: boxResponseSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/boxes/{id}": {
        get: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Get a box",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          responses: {
            "200": {
              description: "Box detail",
              content: {
                "application/json": {
                  schema: boxResponseSchema,
                },
              },
            },
          },
        },
        put: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Update a box",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: boxBodySchema,
              },
            },
          },
          responses: {
            "200": {
              description: "Box updated",
              content: {
                "application/json": {
                  schema: boxResponseSchema,
                },
              },
            },
          },
        },
        delete: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Delete a box",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          responses: {
            "200": {
              description: "Deleted box id",
              content: {
                "application/json": {
                  schema: deleteResponseSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/packing-plans": {
        get: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "List packing plans",
          requestParams: {
            query: paginationQuerySchema,
          },
          responses: {
            "200": {
              description: "Paginated packing plans list",
              content: {
                "application/json": {
                  schema: packingPlanListResponseSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/packing-plans/{id}": {
        get: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Get a packing plan",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          responses: {
            "200": {
              description: "Packing plan detail",
              content: {
                "application/json": {
                  schema: packingPlanResponseSchema,
                },
              },
            },
          },
        },
        put: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Update a packing plan and recalculate packing",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: packingPlanUpdateBodySchema,
              },
            },
          },
          responses: {
            "200": {
              description: "Updated packing plan with packing results",
              content: {
                "application/json": {
                  schema: packingPlanUpdateResponseSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/packing-plans/calculate": {
        post: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Create a packing plan and calculate its box",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: calculatePackingPlanBodySchema,
              },
            },
          },
          responses: {
            "200": {
              description: "Created packing plan with calculated box result",
              content: {
                "application/json": {
                  schema: packingPlanCalculationResponseSchema,
                },
              },
            },
          },
        },
      },
    },
  });
}
