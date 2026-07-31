export const CATALOG_TYPES = [
  "company",
  "workplace",
  "workArea",
  "jobPosition",
  "encounterType",
  "occupationalExposure",
  "workDisability",
  "surgicalProcedure",
  "referralLevel",
  "medicalAptitude",
  "relationshipType",
  "allergyCategory",
  "allergenCatalog",
  "diseaseType",
  "maritalStatus",
  "bloodType",
  "habitCatalog",
  "suspensionHour",
] as const;

export type CatalogType = typeof CATALOG_TYPES[number];
