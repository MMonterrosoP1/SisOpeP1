import { beforeEach, describe, expect, it, vi } from "vitest";

const { cacheLifeMock, cacheTagMock, getCatalogRepoMock, icd10FindManyMock, icd10CountMock } = vi.hoisted(() => ({
  cacheLifeMock: vi.fn(),
  cacheTagMock: vi.fn(),
  getCatalogRepoMock: vi.fn(),
  icd10FindManyMock: vi.fn(),
  icd10CountMock: vi.fn(),
}));

vi.mock("next/cache", () => ({
  cacheLife: cacheLifeMock,
  cacheTag: cacheTagMock,
}));

vi.mock("./repository", () => ({
  getCatalogRepo: getCatalogRepoMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    icd10Code: {
      findMany: icd10FindManyMock,
      count: icd10CountMock,
    },
  },
}));

import { prisma } from "@/lib/prisma";

import { getCatalogById, getCatalogs, searchIcd10 } from "./queries";

describe("catalog queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getCatalogs: returns [] when repo does not exist", async () => {
    getCatalogRepoMock.mockReturnValueOnce(undefined);

    const result = await getCatalogs("company");

    expect(result).toEqual([]);
  });

  it("getCatalogs: applies activeOnly filter by default", async () => {
    const findAll = vi.fn().mockResolvedValueOnce([{ id: 1 }]);
    getCatalogRepoMock.mockReturnValueOnce({ findAll });

    const result = await getCatalogs("company");

    expect(findAll).toHaveBeenCalledWith({ active: true });
    expect(result).toEqual([{ id: 1 }]);
    expect(cacheTagMock).toHaveBeenCalledWith("catalog-company");
  });

  it("getCatalogs: omits active filter when activeOnly=false", async () => {
    const findAll = vi.fn().mockResolvedValueOnce([{ id: 2 }]);
    getCatalogRepoMock.mockReturnValueOnce({ findAll });

    await getCatalogs("company", false);

    expect(findAll).toHaveBeenCalledWith(undefined);
  });

  it("getCatalogById: returns null when repo does not exist", async () => {
    getCatalogRepoMock.mockReturnValueOnce(undefined);

    const result = await getCatalogById("company", 10);

    expect(result).toBeNull();
  });

  it("getCatalogById: delegates to repo", async () => {
    const findById = vi.fn().mockResolvedValueOnce({ id: 10 });
    getCatalogRepoMock.mockReturnValueOnce({ findById });

    const result = await getCatalogById("company", 10);

    expect(findById).toHaveBeenCalledWith(10);
    expect(result).toEqual({ id: 10 });
  });

  it("searchIcd10: returns active records when query is empty", async () => {
    (prisma.icd10Code.findMany as any).mockResolvedValue([{ id: 1 }]);
    (prisma.icd10Code.count as any) = vi.fn().mockResolvedValue(1);
    
    const result = await searchIcd10("");
    
    expect(prisma.icd10Code.findMany).toHaveBeenCalledWith({
      where: { active: true },
      take: 50,
      skip: 0,
      orderBy: { code: "asc" },
    });
    expect(prisma.icd10Code.count).toHaveBeenCalledWith({
      where: { active: true },
    });
    expect(result).toEqual({ items: [{ id: 1 }], totalCount: 1, page: 1, pageSize: 50 });
  });

  it("searchIcd10: searches by code or description", async () => {
    (prisma.icd10Code.findMany as any).mockResolvedValue([{ id: 2 }]);
    (prisma.icd10Code.count as any) = vi.fn().mockResolvedValue(1);

    const result = await searchIcd10("diabetes");
    
    expect(prisma.icd10Code.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        active: true,
        OR: [
          { code: { contains: "diabetes" } },
          { description: { search: "+diabetes*" } },
        ],
      },
    }));
    expect(prisma.icd10Code.count).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        active: true,
        OR: [
          { code: { contains: "diabetes" } },
          { description: { search: "+diabetes*" } },
        ],
      }
    }));
    expect(result).toEqual({ items: [{ id: 2 }], totalCount: 1, page: 1, pageSize: 50 });
  });
});