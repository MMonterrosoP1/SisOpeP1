import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "src/features/patient/schemas.ts",
        "src/features/patient/service.ts",
        "src/features/patient/repository.ts",
        "src/features/encounter/domain/bmi-calculator.ts",
        "src/features/encounter/schemas.ts",
        "src/features/encounter/repository.ts",
        "src/features/encounter/service.ts",
        "src/features/encounter/actions.ts",
        "src/features/encounter/queries.ts",
        "src/features/catalog/repository.ts",
        "src/features/catalog/service.ts",
        "src/features/catalog/schemas.ts",
        "src/features/catalog/queries.ts",
        "src/features/document/schemas.ts",
        "src/features/document/service.ts",
        "src/features/document/actions.ts",
        "src/features/document/queries.ts",
        "src/features/patient/queries.ts",
        "src/shared/audit/audit.repository.ts",
        "src/shared/audit/audit.service.ts",
        "src/shared/auth/auth-guard.ts",
        "src/shared/errors/app-error.ts",
        "src/shared/utils/zod-helpers.ts",
        "src/app/api/encounters/recent/route.ts",
        "src/app/api/encounters/*/documents/*/route.ts",
        "src/app/api/search/patients/route.ts",
        "src/app/api/search/icd10/route.ts",
        "src/app/api/auth/*/route.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
