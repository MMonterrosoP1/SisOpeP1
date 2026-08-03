import { z } from "zod";
import { idParamSchema } from "@/shared/utils/zod-helpers";
import { SexSchema } from "@/shared/schemas/enums";

export const createCatalogSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});

export const companySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  acronym: z.string().trim().max(20).optional().transform(v => v || undefined),
});

export const companyUpdateSchema = z.object({
  name: z.string().trim().min(1).max(255).optional(),
  acronym: z.string().trim().max(20).optional().transform(v => v || undefined),
  active: z.boolean().optional(),
});

export const updateCatalogSchema = createCatalogSchema.partial().extend({
  active: z.boolean().optional(),
});

export const allergenCatalogSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  allergyCategoryId: idParamSchema,
});

export const icd10SearchSchema = z.object({
  code: z.string().optional(),
  description: z.string().optional(),
  chapter: z.string().optional(),
});

export const maritalStatusSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  sex: SexSchema.optional(),
});

export const exerciseCatalogSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
});
