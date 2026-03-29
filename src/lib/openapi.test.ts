import { describe, expect, it } from "@jest/globals";
import { buildOpenApiDocument } from "@/lib/openapi";

describe("OpenAPI box contract", () => {
  it("uses measurementUnits for box requests and responses", () => {
    const document = buildOpenApiDocument() as unknown as {
      components?: {
        schemas?: Record<string, unknown>;
      };
      paths: Record<string, Record<string, { requestBody?: { content?: Record<string, { schema?: unknown }> }; responses?: Record<string, { content?: Record<string, { schema?: unknown }> }> }>>;
    };

    const createBox =
      document.paths["/api/v1/boxes"]?.post?.requestBody?.content?.["application/json"]
        ?.schema;
    const boxList =
      document.paths["/api/v1/boxes"]?.get?.responses?.["200"]?.content?.[
        "application/json"
      ]?.schema;
    const boxItem =
      document.paths["/api/v1/boxes/{id}"]?.get?.responses?.["200"]?.content?.[
        "application/json"
      ]?.schema;
    const updateBox =
      document.paths["/api/v1/boxes/{id}"]?.put?.requestBody?.content?.[
        "application/json"
      ]?.schema;

    const serialized = JSON.stringify({
      createBox,
      boxList,
      boxItem,
      updateBox,
    });
    const measurementUnitsComponent = JSON.stringify(
      document.components?.schemas?.MeasurementUnits ?? {}
    );

    expect(serialized).toContain("measurementUnits");
    expect(serialized).not.toContain('"unitSystem"');
    expect(serialized).not.toContain('"units"');
    expect(measurementUnitsComponent).toContain("metric");
    expect(measurementUnitsComponent).toContain("imperial");
  });
});

describe("OpenAPI packing plan calculate contract", () => {
  it("returns a persisted packing plan id", () => {
    const document = buildOpenApiDocument() as unknown as {
      paths: Record<
        string,
        Record<
          string,
          {
            responses?: Record<string, { content?: Record<string, { schema?: unknown }> }>;
          }
        >
      >;
    };

    const calculatePackingPlan =
      document.paths["/api/v1/packing-plans/calculate"]?.post?.responses?.["200"]?.content?.[
        "application/json"
      ]?.schema;
    const serialized = JSON.stringify(calculatePackingPlan);

    expect(serialized).toContain('"id"');
    expect(serialized).toContain("#/components/schemas/PublicId");
  });
});
