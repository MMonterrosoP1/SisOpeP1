import { z } from "zod";
import { idParamSchema } from "@/shared/utils/zod-helpers";
import { DocumentTemplateType } from "./types";

export const generateDocumentSchema = z.object({
  encounterId: idParamSchema,
  documentTypeCode: z.custom<DocumentTemplateType>((val) => typeof val === 'string'),
});
