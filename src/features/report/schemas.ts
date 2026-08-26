import { z } from "zod";

export const reportFiltersSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12).optional().nullable(),
  workplaceId: z.coerce.number().int().positive().optional().nullable(),
});

export const workforceSnapshotSchema = z.object({
  workplaceId: z.coerce.number().int().positive(),
  year: z.coerce.number().int().min(2020),
  month: z.coerce.number().int().min(1).max(12),
  totalWorkers: z.coerce.number().int().min(0),
  maleWorkers: z.coerce.number().int().min(0).default(0),
  femaleWorkers: z.coerce.number().int().min(0).default(0),
  scheduledDays: z.coerce.number().int().min(1).default(22),
  observations: z.string().max(2000).optional().nullable(),
});

export type ReportFiltersInput = z.infer<typeof reportFiltersSchema>;
export type WorkforceSnapshotInput = z.infer<typeof workforceSnapshotSchema>;
