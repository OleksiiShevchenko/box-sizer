import { detectUnitSystemFromLocale } from "./unit-system";

describe("detectUnitSystemFromLocale", () => {
  it("uses imperial units for locales from imperial countries", () => {
    expect(detectUnitSystemFromLocale("en-US")).toBe("in");
    expect(detectUnitSystemFromLocale("en-LR")).toBe("in");
    expect(detectUnitSystemFromLocale("my-MM")).toBe("in");
  });

  it("defaults to metric units for other or missing locales", () => {
    expect(detectUnitSystemFromLocale("en-GB")).toBe("cm");
    expect(detectUnitSystemFromLocale("fr-CA")).toBe("cm");
    expect(detectUnitSystemFromLocale("")).toBe("cm");
    expect(detectUnitSystemFromLocale(undefined)).toBe("cm");
  });
});
