import { beforeEach, describe, expect, it, vi } from "vitest";

const { findAllMock, findByIdMock } = vi.hoisted(() => ({
  findAllMock: vi.fn(),
  findByIdMock: vi.fn(),
}));

vi.mock("./repository", () => ({
  patientRepository: {
    findAll: findAllMock,
    findById: findByIdMock,
  },
}));



import { getPatientById, getPatients, searchPatients } from "./queries";

describe("patient queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getPatients: requires auth and returns paginated response", async () => {
    findAllMock.mockResolvedValueOnce({ items: [{ id: 1 }], totalCount: 21 });

    const result = await getPatients({}, { page: 2, pageSize: 10 });

    expect(findAllMock).toHaveBeenCalledWith({}, { skip: 10, take: 10 });
    expect(result).toEqual({
      data: [{ id: 1 }],
      meta: { page: 2, pageSize: 10, totalCount: 21, totalPages: 3 },
    });
  });

  it("getPatientById: requires auth and delegates to repository", async () => {
    findByIdMock.mockResolvedValueOnce({ id: 22 });

    const result = await getPatientById(22);

    expect(findByIdMock).toHaveBeenCalledWith(22);
    expect(result).toEqual({ id: 22 });
  });

  it("searchPatients: returns [] when query is shorter than 2 chars", async () => {
    const result = await searchPatients("a");

    expect(findAllMock).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("searchPatients: delegates search with active filter", async () => {
    findAllMock.mockResolvedValueOnce({ items: [{ id: 1 }], totalCount: 1 });

    const result = await searchPatients("ana", 5);

    expect(findAllMock).toHaveBeenCalledWith({ search: "ana", active: true }, { skip: 0, take: 5 });
    expect(result).toEqual([{ id: 1 }]);
  });
});