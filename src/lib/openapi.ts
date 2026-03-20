import { z } from "zod/v4";
import { createDocument } from "zod-openapi";
import {
  apiErrorSchema,
  boxBodySchema,
  boxListResponseSchema,
  boxResponseSchema,
  calculateShipmentBodySchema,
  deleteResponseSchema,
  oauthTokenRequestSchema,
  oauthTokenResponseSchema,
  paginationQuerySchema,
  publicIdSchema,
  shipmentListResponseSchema,
  shipmentResponseSchema,
  shipmentCalculationResponseSchema,
  shipmentUpdateBodySchema,
  shipmentUpdateResponseSchema,
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
      description: "OAuth-protected API for packaging, shipments, and packing calculations.",
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
      "/api/v1/packaging": {
        get: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "List packaging",
          requestParams: {
            query: paginationQuerySchema,
          },
          responses: {
            "200": {
              description: "Paginated packaging list",
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
          summary: "Create packaging",
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
              description: "Packaging created",
              content: {
                "application/json": {
                  schema: boxResponseSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/packaging/{id}": {
        get: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Get packaging",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          responses: {
            "200": {
              description: "Packaging item",
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
          summary: "Update packaging",
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
              description: "Packaging updated",
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
          summary: "Delete packaging",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          responses: {
            "200": {
              description: "Deleted packaging id",
              content: {
                "application/json": {
                  schema: deleteResponseSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/shipments": {
        get: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "List shipments",
          requestParams: {
            query: paginationQuerySchema,
          },
          responses: {
            "200": {
              description: "Paginated shipments list",
              content: {
                "application/json": {
                  schema: shipmentListResponseSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/shipments/{id}": {
        get: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Get shipment",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          responses: {
            "200": {
              description: "Shipment detail",
              content: {
                "application/json": {
                  schema: shipmentResponseSchema,
                },
              },
            },
          },
        },
        put: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Update shipment and recalculate packing",
          requestParams: {
            path: z.object({ id: idPathSchema }),
          },
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: shipmentUpdateBodySchema,
              },
            },
          },
          responses: {
            "200": {
              description: "Updated shipment with packing results",
              content: {
                "application/json": {
                  schema: shipmentUpdateResponseSchema,
                },
              },
            },
          },
        },
      },
      "/api/v1/shipments/calculate": {
        post: {
          security: [{ OAuth2ClientCredentials: [] }],
          summary: "Calculate best shipment packaging without saving",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: calculateShipmentBodySchema,
              },
            },
          },
          responses: {
            "200": {
              description: "Calculated shipment result",
              content: {
                "application/json": {
                  schema: shipmentCalculationResponseSchema,
                },
              },
            },
          },
        },
      },
    },
  });
}
