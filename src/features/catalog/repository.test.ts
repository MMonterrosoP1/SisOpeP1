import { beforeEach, describe, expect, it, vi } from "vitest";

function makeDelegate() {
  return {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    company: makeDelegate(),
    workplace: makeDelegate(),
    workArea: makeDelegate(),
    jobPosition: makeDelegate(),
    encounterType: makeDelegate(),
    occupationalExposure: makeDelegate(),
    workDisability: makeDelegate(),
    surgicalProcedureCatalog: makeDelegate(),
    referralLevel: makeDelegate(),
    medicalAptitude: makeDelegate(),
    relationshipType: makeDelegate(),
    allergyCategory: makeDelegate(),
    allergenCatalog: makeDelegate(),
    diseaseTypeCatalog: makeDelegate(),
    maritalStatusCatalog: makeDelegate(),
    bloodTypeCatalog: makeDelegate(),
    habitCatalog: makeDelegate(),
    suspensionHourCatalog: makeDelegate(),
    exerciseCatalog: makeDelegate(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { createCatalogRepo, getCatalogRepo } from "./repository";

describe("createCatalogRepo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("findAll applies active and search filters when active field exists", async () => {
    const delegate = makeDelegate();
    delegate.findMany.mockResolvedValueOnce([]);
    const repo = createCatalogRepo(delegate, true);

    await repo.findAll({ active: true, search: "emp" });

    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { active: true, name: { contains: "emp" } },
      orderBy: { name: "asc" },
    });
  });

  it("findAll ignores active filter when active field is disabled", async () => {
    const delegate = makeDelegate();
    delegate.findMany.mockResolvedValueOnce([]);
    const repo = createCatalogRepo(delegate, false);

    await repo.findAll({ active: false, search: "x" });

    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { name: { contains: "x" } },
      orderBy: { name: "asc" },
    });
  });

  it("delegates findById/findByName/create/update", async () => {
    const delegate = makeDelegate();
    const repo = createCatalogRepo(delegate, true);

    await repo.findById(7);
    await repo.findByName("ABC");
    await repo.create({ name: "ABC" });
    await repo.update(7, { name: "DEF" });

    expect(delegate.findUnique).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(delegate.findFirst).toHaveBeenCalledWith({ where: { name: "ABC" } });
    expect(delegate.create).toHaveBeenCalledWith({ data: { name: "ABC" } });
    expect(delegate.update).toHaveBeenCalledWith({ where: { id: 7 }, data: { name: "DEF" } });
  });
});

describe("getCatalogRepo", () => {
  it("returns a repo for known catalog type", () => {
    expect(getCatalogRepo("company")).toBeDefined();
    expect(getCatalogRepo("medicalAptitude")).toBeDefined();
  });

  it("returns undefined for unknown type", () => {
    expect(getCatalogRepo("unknown-type")).toBeUndefined();
  });
});

describe("exerciseCatalogRepo.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("auto-generates code from name", async () => {
    prismaMock.exerciseCatalog.create.mockResolvedValueOnce({ id: 1, name: "CROSS FIT", code: "CROSS_FIT" });

    const { exerciseCatalogRepo } = await import("./repository");
    await exerciseCatalogRepo.create({ name: "Cross Fit" });

    expect(prismaMock.exerciseCatalog.create).toHaveBeenCalledWith({
      data: { name: "Cross Fit", code: "CROSS_FIT" },
    });
  });

  it("handles single-word names without underscores", async () => {
    prismaMock.exerciseCatalog.create.mockResolvedValueOnce({ id: 2, name: "GYM", code: "GYM" });

    const { exerciseCatalogRepo } = await import("./repository");
    await exerciseCatalogRepo.create({ name: "GYM" });

    expect(prismaMock.exerciseCatalog.create).toHaveBeenCalledWith({
      data: { name: "GYM", code: "GYM" },
    });
  });
});