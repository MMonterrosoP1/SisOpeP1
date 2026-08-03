import { beforeEach, describe, expect, it, vi } from "vitest";

const { findAllMock, findLatestByPatientMock, getDetailMock } = vi.hoisted(() => ({
  findAllMock: vi.fn(),
  findLatestByPatientMock: vi.fn(),
  getDetailMock: vi.fn(),
}));

vi.mock("./repository", () => ({
  encounterRepository: {
    findAll: findAllMock,
    findLatestByPatient: findLatestByPatientMock,
  },
}));

vi.mock("./service", () => ({
  encounterService: {
    getDetail: getDetailMock,
  },
}));

import {
  getEncounterById,
  getEncounters,
  getEncountersByPatient,
  getLatestEncounterByPatient,
} from "./queries";

describe("encounter queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getEncounters: parses pagination and returns paginated result", async () => {
    findAllMock.mockResolvedValueOnce({ items: [{ id: 1 }], totalCount: 6 });

    const result = await getEncounters({}, { page: 2, pageSize: 2 });

    expect(findAllMock).toHaveBeenCalledWith({}, { skip: 2, take: 2 });
    expect(result).toEqual({
      data: [{ id: 1 }],
      meta: { page: 2, pageSize: 2, totalCount: 6, totalPages: 3 },
    });
  });

  it("getEncounterById: delegates to service", async () => {
    getDetailMock.mockResolvedValueOnce({ id: 9 });

    const result = await getEncounterById(9);

    expect(getDetailMock).toHaveBeenCalledWith(9);
    expect(result).toEqual({ id: 9 });
  });

  it("getEncountersByPatient: forwards patient filter", async () => {
    findAllMock.mockResolvedValueOnce({ items: [{ id: 2 }], totalCount: 1 });

    const result = await getEncountersByPatient(55, { page: 1, pageSize: 10 });

    expect(findAllMock).toHaveBeenCalledWith({ patientId: 55 }, { skip: 0, take: 10 });
    expect(result.data).toEqual([{ id: 2 }]);
  });

  it("getLatestEncounterByPatient: delegates to repository", async () => {
    findLatestByPatientMock.mockResolvedValueOnce({ id: 88 });

    const result = await getLatestEncounterByPatient(55);

    expect(findLatestByPatientMock).toHaveBeenCalledWith(55);
    expect(result).toEqual({ id: 88 });
  });
});