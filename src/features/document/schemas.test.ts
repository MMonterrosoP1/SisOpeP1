import { describe, expect, it } from "vitest";
import { generateDocumentSchema } from "./schemas";

describe("generateDocumentSchema", () => {
  it("accepts a valid payload", () => {
    const result = generateDocumentSchema.safeParse({
      encounterId: 12,
      documentTypeCode: "MEDICAL_CERTIFICATE",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid encounter id", () => {
    const result = generateDocumentSchema.safeParse({
      encounterId: 0,
      documentTypeCode: "MEDICAL_CERTIFICATE",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "encounterId");
      expect(issue).toBeDefined();
    }
  });

  it("rejects non-string documentTypeCode", () => {
    const result = generateDocumentSchema.safeParse({
      encounterId: 12,
      documentTypeCode: 123,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.join(".") === "documentTypeCode");
      expect(issue).toBeDefined();
    }
  });
});