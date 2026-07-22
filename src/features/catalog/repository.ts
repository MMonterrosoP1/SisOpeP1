import { prisma } from "@/lib/prisma";

type PrismaDelegate = any;

export function createCatalogRepo(delegate: PrismaDelegate, hasActiveField: boolean = true) {
  return {
    findAll: async (filter?: { active?: boolean; search?: string }) => {
      const where: any = {};
      if (hasActiveField && filter?.active !== undefined) {
        where.active = filter.active;
      }
      if (filter?.search) {
        where.name = { contains: filter.search };
      }
      return delegate.findMany({ where, orderBy: { name: "asc" } });
    },
    findById: async (id: number) => {
      return delegate.findUnique({ where: { id } });
    },
    findByName: async (name: string) => {
      return delegate.findFirst({ where: { name } });
    },
    create: async (data: any) => {
      return delegate.create({ data });
    },
    update: async (id: number, data: any) => {
      return delegate.update({ where: { id }, data });
    },
  };
}

export const companyRepo = createCatalogRepo(prisma.company);
export const workplaceRepo = createCatalogRepo(prisma.workplace);
export const workAreaRepo = createCatalogRepo(prisma.workArea);
export const jobPositionRepo = createCatalogRepo(prisma.jobPosition);
export const encounterTypeRepo = createCatalogRepo(prisma.encounterType, false);
export const occupationalExposureRepo = createCatalogRepo(prisma.occupationalExposure);
export const workDisabilityRepo = createCatalogRepo(prisma.workDisability);
export const surgicalProcedureRepo = createCatalogRepo(prisma.surgicalProcedureCatalog);
export const referralLevelRepo = createCatalogRepo(prisma.referralLevel);
export const medicalAptitudeRepo = createCatalogRepo(prisma.medicalAptitude, false);
export const relationshipTypeRepo = createCatalogRepo(prisma.relationshipType, false);
export const allergyCategoryRepo = createCatalogRepo(prisma.allergyCategory);
export const allergenCatalogRepo = createCatalogRepo(prisma.allergenCatalog);
export const diseaseTypeRepo = createCatalogRepo(prisma.diseaseTypeCatalog);
export const maritalStatusRepo = createCatalogRepo(prisma.maritalStatusCatalog);
export const bloodTypeRepo = createCatalogRepo(prisma.bloodTypeCatalog);

export const getCatalogRepo = (type: string) => {
  const map: Record<string, ReturnType<typeof createCatalogRepo>> = {
    company: companyRepo,
    workplace: workplaceRepo,
    workArea: workAreaRepo,
    jobPosition: jobPositionRepo,
    encounterType: encounterTypeRepo,
    occupationalExposure: occupationalExposureRepo,
    workDisability: workDisabilityRepo,
    surgicalProcedure: surgicalProcedureRepo,
    referralLevel: referralLevelRepo,
    medicalAptitude: medicalAptitudeRepo,
    relationshipType: relationshipTypeRepo,
    allergyCategory: allergyCategoryRepo,
    allergenCatalog: allergenCatalogRepo,
    diseaseType: diseaseTypeRepo,
    maritalStatus: maritalStatusRepo,
    bloodType: bloodTypeRepo,
  };
  return map[type];
};
