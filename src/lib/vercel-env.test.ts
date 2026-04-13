import { isProductionDeployment } from "./vercel-env";

describe("isProductionDeployment", () => {
  const originalVercelEnv = process.env.VERCEL_ENV;

  afterEach(() => {
    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV;
      return;
    }

    process.env.VERCEL_ENV = originalVercelEnv;
  });

  it("returns true for production deployments", () => {
    process.env.VERCEL_ENV = "production";

    expect(isProductionDeployment()).toBe(true);
  });

  it("returns false for preview deployments", () => {
    process.env.VERCEL_ENV = "preview";

    expect(isProductionDeployment()).toBe(false);
  });

  it("returns false when VERCEL_ENV is unset", () => {
    delete process.env.VERCEL_ENV;

    expect(isProductionDeployment()).toBe(false);
  });
});
