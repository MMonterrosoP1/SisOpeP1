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
export const workplaceRepo = {
  ...createCatalogRepo(prisma.workplace),
  findAll: async (filter?: { active?: boolean; search?: string }) => {
    const where: any = {};
    if (filter?.active !== undefined) where.active = filter.active;
    if (filter?.search) where.name = { contains: filter.search };
    return prisma.workplace.findMany({ 
      where, 
      orderBy: { name: "asc" }
    });
  }
};

export const workAreaRepo = {
  ...createCatalogRepo(prisma.workArea),
  findAll: async (filter?: { active?: boolean; search?: string; type?: string }) => {
    const where: any = {};
    if (filter?.active !== undefined) where.active = filter.active;
    if (filter?.search) where.name = { contains: filter.search };
    if (filter?.type) where.type = filter.type;
    return prisma.workArea.findMany({ where, orderBy: { name: "asc" } });
  }
};

export const jobPositionRepo = {
  ...createCatalogRepo(prisma.jobPosition),
  findAll: async (filter?: { active?: boolean; search?: string; type?: string }) => {
    const where: any = {};
    if (filter?.active !== undefined) where.active = filter.active;
    if (filter?.search) where.name = { contains: filter.search };
    if (filter?.type) where.OR = [{ type: filter.type }, { type: null }];
    return prisma.jobPosition.findMany({ where, orderBy: { name: "asc" } });
  }
};
export const encounterTypeRepo = {
  ...createCatalogRepo(prisma.encounterType, false),
  create: async (data: { name: string; [key: string]: any }) => {
    const code = data.name.toUpperCase().replace(/\s+/g, "_");
    return prisma.encounterType.create({ data: { ...data, code } });
  },
};
export const occupationalExposureRepo = createCatalogRepo(prisma.occupationalExposure);
export const workDisabilityRepo = createCatalogRepo(prisma.workDisability);
export const surgicalProcedureRepo = createCatalogRepo(prisma.surgicalProcedureCatalog);
export const referralLevelRepo = createCatalogRepo(prisma.referralLevel);
export const medicalAptitudeRepo = createCatalogRepo(prisma.medicalAptitude, false);
export const relationshipTypeRepo = createCatalogRepo(prisma.relationshipType, false);
export const allergyCategoryRepo = createCatalogRepo(prisma.allergyCategory);
export const allergenCatalogRepo = {
  ...createCatalogRepo(prisma.allergenCatalog),
  findAll: async (filter?: { active?: boolean; search?: string }) => {
    const where: any = {};
    if (filter?.active !== undefined) where.active = filter.active;
    if (filter?.search) where.name = { contains: filter.search };
    return prisma.allergenCatalog.findMany({ 
      where, 
      orderBy: { name: "asc" },
      include: { allergyCategory: true }
    });
  },
  create: async (data: any) => {
    return prisma.allergenCatalog.create({
      data,
      include: { allergyCategory: true }
    });
  }
};
export const diseaseTypeRepo = createCatalogRepo(prisma.diseaseTypeCatalog);
export const maritalStatusRepo = createCatalogRepo(prisma.maritalStatusCatalog);
export const bloodTypeRepo = createCatalogRepo(prisma.bloodTypeCatalog);
export const habitCatalogRepo = createCatalogRepo(prisma.habitCatalog);
export const suspensionHourRepo = createCatalogRepo(prisma.suspensionHourCatalog);
export const exerciseCatalogRepo = {
  ...createCatalogRepo(prisma.exerciseCatalog, false),
  create: async (data: { name: string }) => {
    const code = data.name.toUpperCase().replace(/\s+/g, "_");
    return prisma.exerciseCatalog.create({ data: { ...data, code } });
  },
};

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
    habitCatalog: habitCatalogRepo,
    suspensionHour: suspensionHourRepo,
    exerciseCatalog: exerciseCatalogRepo,
  };
  return map[type];
};
