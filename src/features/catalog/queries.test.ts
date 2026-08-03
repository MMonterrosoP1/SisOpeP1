import { beforeEach, describe, expect, it, vi } from "vitest";

const { cacheLifeMock, cacheTagMock, getCatalogRepoMock, icd10FindManyMock } = vi.hoisted(() => ({
  cacheLifeMock: vi.fn(),
  cacheTagMock: vi.fn(),
  getCatalogRepoMock: vi.fn(),
  icd10FindManyMock: vi.fn(),
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
    },
  },
}));

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
    icd10FindManyMock.mockResolvedValueOnce([{ code: "A01" }]);

    const result = await searchIcd10("", 5);

    expect(icd10FindManyMock).toHaveBeenCalledWith({
      where: { active: true },
      take: 5,
      orderBy: { code: "asc" },
    });
    expect(result).toEqual([{ code: "A01" }]);
  });

  it("searchIcd10: searches by code or description", async () => {
    icd10FindManyMock.mockResolvedValueOnce([{ code: "A01" }]);

    await searchIcd10("fiebre", 3);

    expect(icd10FindManyMock).toHaveBeenCalledWith({
      where: {
        active: true,
        OR: [
          { code: { contains: "fiebre" } },
          { description: { contains: "fiebre" } },
        ],
      },
      take: 3,
      orderBy: { code: "asc" },
    });
  });
});