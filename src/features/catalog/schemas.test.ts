import { describe, expect, it } from "vitest";
import {
  allergenCatalogSchema,
  createCatalogSchema,
  exerciseCatalogSchema,
  icd10SearchSchema,
  maritalStatusSchema,
  updateCatalogSchema,
} from "./schemas";

describe("catalog schemas", () => {
  it("createCatalogSchema trims and validates required name", () => {
    const valid = createCatalogSchema.safeParse({ name: "  Empresa  " });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.name).toBe("Empresa");
    }

    const invalid = createCatalogSchema.safeParse({ name: "" });
    expect(invalid.success).toBe(false);
  });

  it("updateCatalogSchema allows partial payload", () => {
    const result = updateCatalogSchema.safeParse({ active: false });
    expect(result.success).toBe(true);
  });

  it("allergenCatalogSchema requires allergyCategoryId", () => {
    const invalid = allergenCatalogSchema.safeParse({ name: "Polen" });
    expect(invalid.success).toBe(false);

    const valid = allergenCatalogSchema.safeParse({ name: "Polen", allergyCategoryId: 1 });
    expect(valid.success).toBe(true);
  });

  it("icd10SearchSchema accepts optional fields", () => {
    expect(icd10SearchSchema.safeParse({}).success).toBe(true);
    expect(icd10SearchSchema.safeParse({ code: "A01", description: "Foo" }).success).toBe(true);
  });

  it("maritalStatusSchema accepts optional sex", () => {
    expect(maritalStatusSchema.safeParse({ name: "Casado" }).success).toBe(true);
    expect(maritalStatusSchema.safeParse({ name: "Casada", sex: "FEMALE" }).success).toBe(true);
  });

  it("exerciseCatalogSchema requires name and auto-derives code", () => {
    const missingName = exerciseCatalogSchema.safeParse({});
    expect(missingName.success).toBe(false);

    const valid = exerciseCatalogSchema.safeParse({ name: "GYM" });
    expect(valid.success).toBe(true);
  });
});