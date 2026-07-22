import { z } from "zod";
import { idParamSchema } from "@/shared/utils/zod-helpers";

export const generateCertificateSchema = z.object({
  encounterId: idParamSchema,
});
