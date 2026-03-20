import "zod-openapi";
import { z } from "zod/v4";

const isoDateSchema = z.string().datetime().meta({
  description: "ISO 8601 timestamp",
  example: "2026-03-19T20:15:30.000Z",
});

export const publicIdSchema = z.string().uuid().meta({
  id: "PublicId",
  description: "Public UUID for an API resource",
  example: "0f2f81be-c7ad-4122-8f87-7f0ce6675c54",
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).meta({
    description: "Page number",
    example: 1,
  }),
  pageSize: z.coerce.number().int().min(1).max(100).default(20).meta({
    description: "Page size",
    example: 20,
  }),
});

export const boxBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  width: z.number().positive(),
  height: z.number().positive(),
  depth: z.number().positive(),
  spacing: z.number().nonnegative().default(0),
  maxWeight: z.number().positive().nullable().optional(),
});

export const boxResponseSchema = boxBodySchema.extend({
  id: publicIdSchema,
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
});

export const shipmentItemBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  width: z.number().positive(),
  height: z.number().positive(),
  depth: z.number().positive(),
  weight: z.number().nonnegative().nullable().optional(),
  canStackOnTop: z.boolean().default(true),
  canBePlacedOnTop: z.boolean().default(true),
  orientation: z.enum(["any", "horizontal", "vertical"]).default("any"),
});

export const shipmentItemResponseSchema = shipmentItemBodySchema.extend({
  id: publicIdSchema,
});

export const packedItemSchema = z.object({
  name: z.string(),
  width: z.number(),
  height: z.number(),
  depth: z.number(),
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const packingResultSchema = z.object({
  box: z.object({
    id: z.string(),
    name: z.string(),
    width: z.number(),
    height: z.number(),
    depth: z.number(),
    spacing: z.number(),
    maxWeight: z.number().nullable(),
  }),
  items: z.array(packedItemSchema),
  dimensionalWeight: z.number(),
});

export const visualizationSchema = z.object({
  status: z.enum(["pending", "ready"]),
  perspectiveUrl: z.string().url(),
  frontUrl: z.string().url(),
  sideUrl: z.string().url(),
  topUrl: z.string().url(),
});

export const shipmentResponseSchema = z.object({
  id: publicIdSchema,
  name: z.string(),
  spacingOverride: z.number().nullable(),
  dimensionalWeight: z.number().nullable(),
  box: boxResponseSchema.nullable(),
  items: z.array(shipmentItemResponseSchema),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
  visualization: visualizationSchema.optional(),
});

export const shipmentUpdateBodySchema = z.object({
  name: z.string().trim().min(1).max(120),
  spacingOverride: z.number().nonnegative().nullable().optional(),
  items: z.array(shipmentItemBodySchema).min(1),
  renderVisualization: z.boolean().default(false),
});

export const calculateShipmentBodySchema = z.object({
  items: z.array(shipmentItemBodySchema).min(1),
  spacingOverride: z.number().nonnegative().nullable().optional(),
  includeIdealBox: z.boolean().default(false),
  renderVisualization: z.boolean().default(false),
});

export const oauthTokenRequestSchema = z.object({
  client_id: z.string().trim().min(1),
  client_secret: z.string().trim().min(1),
});

export const oauthTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.literal(3600),
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export const paginationResponseSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().positive(),
});

export const boxListResponseSchema = z.object({
  data: z.array(boxResponseSchema),
  pagination: paginationResponseSchema,
});

export const shipmentListResponseSchema = z.object({
  data: z.array(shipmentResponseSchema),
  pagination: paginationResponseSchema,
});

export const deleteResponseSchema = z.object({
  id: publicIdSchema,
});

export const shipmentCalculationResponseSchema = z.object({
  result: z.object({
    boxes: z.array(packingResultSchema),
    idealBox: packingResultSchema.nullable().optional(),
  }),
  visualization: visualizationSchema.optional(),
});

export const shipmentUpdateResponseSchema = z.object({
  shipment: shipmentResponseSchema,
  result: z.object({
    boxes: z.array(packingResultSchema),
    idealBox: packingResultSchema.nullable().optional(),
  }),
  visualization: visualizationSchema.optional(),
});
