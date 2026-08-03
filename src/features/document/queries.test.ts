import { beforeEach, describe, expect, it, vi } from "vitest";

const { findByEncounterAndTypeMock, findByEncounterIdsAndTypeMock, findAllMock } = vi.hoisted(() => ({
  findByEncounterAndTypeMock: vi.fn(),
  findByEncounterIdsAndTypeMock: vi.fn(),
  findAllMock: vi.fn(),
}));

vi.mock("./repository", () => ({
  documentRepository: {
    findByEncounterAndType: findByEncounterAndTypeMock,
    findByEncounterIdsAndType: findByEncounterIdsAndTypeMock,
    findAll: findAllMock,
  },
}));

import {
  getDocumentByEncounterAndType,
  getDocumentStatusByEncounterIdsAndType,
  getDocuments,
} from "./queries";

describe("document queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getDocumentByEncounterAndType: delegates to repository", async () => {
    findByEncounterAndTypeMock.mockResolvedValueOnce({ id: 1 });

    const result = await getDocumentByEncounterAndType(10, "MEDICAL_CERTIFICATE");

    expect(findByEncounterAndTypeMock).toHaveBeenCalledWith(10, "MEDICAL_CERTIFICATE");
    expect(result).toEqual({ id: 1 });
  });

  it("getDocumentStatusByEncounterIdsAndType: short-circuits on empty ids", async () => {
    const result = await getDocumentStatusByEncounterIdsAndType([], "MEDICAL_CERTIFICATE");

    expect(findByEncounterIdsAndTypeMock).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("getDocumentStatusByEncounterIdsAndType: delegates with ids", async () => {
    findByEncounterIdsAndTypeMock.mockResolvedValueOnce([{ id: 2 }]);

    const result = await getDocumentStatusByEncounterIdsAndType([1, 2], "ILLNESS_CERTIFICATE");

    expect(findByEncounterIdsAndTypeMock).toHaveBeenCalledWith([1, 2], "ILLNESS_CERTIFICATE");
    expect(result).toEqual([{ id: 2 }]);
  });

  it("getDocuments: returns paginated response", async () => {
    findAllMock.mockResolvedValueOnce({ items: [{ id: 5 }], totalCount: 9 });

    const result = await getDocuments({ search: "abc", type: "MEDICAL_CERTIFICATE" }, { page: 2, pageSize: 4 });

    expect(findAllMock).toHaveBeenCalledWith(
      { search: "abc", type: "MEDICAL_CERTIFICATE" },
      { skip: 4, take: 4 }
    );
    expect(result).toEqual({
      data: [{ id: 5 }],
      meta: { page: 2, pageSize: 4, totalCount: 9, totalPages: 3 },
    });
  });
});