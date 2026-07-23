import { Prisma } from "@/generated/prisma/client";
import { createPatientSchema, patientFilterSchema, updatePatientSchema } from "./schemas";
import { z } from "zod";

export type PatientWithRelations = Prisma.PatientGetPayload<{
  include: {
    company: true;
    workplace: true;
    workArea: true;
    jobPosition: true;
    maritalStatus: true;
    bloodType: true;
    emergencyContacts: {
      include: {
        relationshipType: true;
      };
    };
  };
}>;

export type PatientFilters = z.infer<typeof patientFilterSchema>;

export type PatientCreateInput = z.infer<typeof createPatientSchema>;

export type PatientUpdateInput = z.infer<typeof updatePatientSchema>;

export type PatientListItem = {
  id: number;
  givenNames: string;
  familyNames: string;
  identityDocument: string;
  documentType: string;
  birthDate: Date;
  sex: string;
  active: boolean;
  companyName?: string;
  companyAcronym?: string | null;
  workplaceName?: string;
};
