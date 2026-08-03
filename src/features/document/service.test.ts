import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "@/shared/errors/app-error";

const {
  documentRepositoryMock,
  auditServiceMock,
  putMock,
  renderToBufferMock,
  templateRegistryMock,
} = vi.hoisted(() => ({
  documentRepositoryMock: {
    findByEncounterWithRelations: vi.fn(),
    create: vi.fn(),
    findByEncounterAndType: vi.fn(),
    updatePdfUrl: vi.fn(),
  },
  auditServiceMock: {
    log: vi.fn(),
  },
  putMock: vi.fn(),
  renderToBufferMock: vi.fn(),
  templateRegistryMock: {
    MEDICAL_CERTIFICATE: {
      component: () => null,
      mapData: vi.fn(),
    },
    ILLNESS_CERTIFICATE: {
      component: () => null,
      mapData: vi.fn(),
    },
  } as Record<string, { component: unknown; mapData: ReturnType<typeof vi.fn> }>,
}));

vi.mock("./repository", () => ({
  documentRepository: documentRepositoryMock,
}));

vi.mock("@/shared/audit/audit.service", () => ({
  auditService: auditServiceMock,
}));

vi.mock("@vercel/blob", () => ({
  put: putMock,
}));

vi.mock("@react-pdf/renderer", () => ({
  renderToBuffer: renderToBufferMock,
}));

vi.mock("./templates", () => ({
  templateRegistry: templateRegistryMock,
}));

import { documentService } from "./service";

function makeEncounter(overrides: Record<string, unknown> = {}) {
  return {
    id: 100,
    patientId: 200,
    createdAt: new Date("2026-01-02T00:00:00.000Z"),
    medicalAptitudeId: 1,
    diagnoses: [{ id: 1 }],
    documents: [],
    patient: {
      person: {
        identityDocument: "1234567890123",
      },
    },
    ...overrides,
  };
}

describe("documentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generateDocument: throws NotFoundError when encounter does not exist", async () => {
    documentRepositoryMock.findByEncounterWithRelations.mockResolvedValueOnce(null);

    await expect(documentService.generateDocument(100, "user-1", "MEDICAL_CERTIFICATE")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("generateDocument: validates medical certificate requires medical aptitude", async () => {
    documentRepositoryMock.findByEncounterWithRelations.mockResolvedValueOnce(
      makeEncounter({ medicalAptitudeId: null })
    );

    await expect(documentService.generateDocument(100, "user-1", "MEDICAL_CERTIFICATE")).rejects.toBeInstanceOf(ValidationError);
  });

  it("generateDocument: validates illness certificate requires diagnoses", async () => {
    documentRepositoryMock.findByEncounterWithRelations.mockResolvedValueOnce(makeEncounter({ diagnoses: [] }));

    await expect(documentService.generateDocument(100, "user-1", "ILLNESS_CERTIFICATE")).rejects.toBeInstanceOf(ValidationError);
  });

  it("generateDocument: returns existing document when PDF already exists", async () => {
    const existing = {
      id: 10,
      pdfUrl: "https://blob.existing/document.pdf",
      documentType: { code: "MEDICAL_CERTIFICATE" },
    };
    documentRepositoryMock.findByEncounterWithRelations.mockResolvedValueOnce(
      makeEncounter({ documents: [existing] })
    );

    const result = await documentService.generateDocument(100, "user-1", "MEDICAL_CERTIFICATE");

    expect(result).toBe(existing);
    expect(documentRepositoryMock.create).not.toHaveBeenCalled();
    expect(renderToBufferMock).not.toHaveBeenCalled();
    expect(putMock).not.toHaveBeenCalled();
    expect(documentRepositoryMock.updatePdfUrl).not.toHaveBeenCalled();
  });

  it("generateDocument: creates, renders, uploads, updates and audits on happy path", async () => {
    const encounter = makeEncounter();
    const documentRecord = { id: 33 };
    const mappedData = { foo: "bar" };
    const updatedDocument = { id: 33, pdfUrl: "https://blob.test/file.pdf" };

    documentRepositoryMock.findByEncounterWithRelations.mockResolvedValueOnce(encounter);
    documentRepositoryMock.create.mockResolvedValueOnce({ id: 33 });
    documentRepositoryMock.findByEncounterAndType.mockResolvedValueOnce(documentRecord);
    templateRegistryMock.MEDICAL_CERTIFICATE.mapData.mockReturnValueOnce(mappedData);
    renderToBufferMock.mockResolvedValueOnce(Buffer.from("pdf-data"));
    putMock.mockResolvedValueOnce({ url: "https://blob.test/file.pdf" });
    documentRepositoryMock.updatePdfUrl.mockResolvedValueOnce(updatedDocument);

    const result = await documentService.generateDocument(100, "user-9", "MEDICAL_CERTIFICATE");

    expect(documentRepositoryMock.create).toHaveBeenCalledWith(100, 200, "user-9", "MEDICAL_CERTIFICATE");
    expect(templateRegistryMock.MEDICAL_CERTIFICATE.mapData).toHaveBeenCalledWith(encounter);
    expect(renderToBufferMock).toHaveBeenCalled();
    expect(putMock).toHaveBeenCalledWith(
      expect.stringContaining("MEDICAL_CERTIFICATE-100-"),
      expect.any(Buffer),
      {
        access: "private",
        contentType: "application/pdf",
      }
    );
    expect(documentRepositoryMock.updatePdfUrl).toHaveBeenCalledWith(33, "https://blob.test/file.pdf");
    expect(auditServiceMock.log).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-9",
        action: "EXPORT",
        entityType: "document",
        entityId: 33,
      })
    );
    expect(result).toBe(updatedDocument);
  });

  it("generateDocument: throws when template is missing", async () => {
    documentRepositoryMock.findByEncounterWithRelations.mockResolvedValueOnce(makeEncounter());
    documentRepositoryMock.create.mockResolvedValueOnce({ id: 33 });
    documentRepositoryMock.findByEncounterAndType.mockResolvedValueOnce({ id: 33 });

    const original = templateRegistryMock.MEDICAL_CERTIFICATE;
    delete templateRegistryMock.MEDICAL_CERTIFICATE;

    await expect(documentService.generateDocument(100, "user-9", "MEDICAL_CERTIFICATE")).rejects.toMatchObject({
      message: "Template no encontrado para MEDICAL_CERTIFICATE",
    });

    templateRegistryMock.MEDICAL_CERTIFICATE = original;
  });
});