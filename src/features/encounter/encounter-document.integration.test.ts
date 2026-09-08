import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const {
  withAuthMock,
  auditLogMock,
  putMock,
  getMock,
  renderToBufferMock,
  mapDataMock,
  prismaMock,
  state,
} = vi.hoisted(() => {
  const state = {
    encounterIdSeq: 100,
    documentIdSeq: 300,
    encounters: [] as any[],
    documents: [] as any[],
    patient: {
      id: 1,
      active: true,
      person: {
        id: 10,
        sex: "FEMALE",
        identityDocument: "1234567890",
        givenNames: "Ana",
        familyNames: "Perez",
      },
    },
    documentType: {
      id: 77,
      code: "MEDICAL_CERTIFICATE",
    },
  };

  const prismaMock = {
    $transaction: vi.fn(async (callback) => callback(prismaMock)),
    practitioner: {
      findUnique: vi.fn(async () => ({ id: 20 })),
    },
    patientMedicalHistory: { findMany: vi.fn(async () => []), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    patientFamilyHistory: { findMany: vi.fn(async () => []), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    patientSurgicalHistory: { findMany: vi.fn(async () => []), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    patientTraumaHistory: { findMany: vi.fn(async () => []), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    patientAllergy: { findMany: vi.fn(async () => []), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    patientHabit: { findMany: vi.fn(async () => []), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    patientExercise: { findMany: vi.fn(async () => []), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    patientGynecologicalHistory: { findFirst: vi.fn(async () => null), create: vi.fn(), update: vi.fn(), upsert: vi.fn() },
    patient: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where?.id === state.patient.id) return state.patient;
        return null;
      }),
    },
    encounter: {
      findMany: vi.fn(async ({ where, take }: any) => {
        const filtered = state.encounters.filter((e) => {
          if (where?.patientId && e.patientId !== where.patientId) return false;
          if (where?.encounterTypeId && e.encounterTypeId !== where.encounterTypeId) return false;
          return true;
        });
        return typeof take === "number" ? filtered.slice(0, take) : filtered;
      }),
      count: vi.fn(async ({ where }: any) => {
        return state.encounters.filter((e) => {
          if (where?.patientId && e.patientId !== where.patientId) return false;
          if (where?.encounterTypeId && e.encounterTypeId !== where.encounterTypeId) return false;
          return true;
        }).length;
      }),
      create: vi.fn(async ({ data }: any) => {
        const created = {
          id: ++state.encounterIdSeq,
          patientId: data.patientId,
          encounterTypeId: data.encounterTypeId,
          medicalAptitudeId: data.medicalAptitudeId,
          practitionerId: data.practitionerId,
          diagnoses: data.diagnoses?.create ?? [],
          documents: [],
          patient: state.patient,
        };
        state.encounters.push(created);

        return {
          id: created.id,
          patientId: created.patientId,
          diagnoses: created.diagnoses,
        };
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        const found = state.encounters.find((e) => e.id === where?.id);
        if (!found) return null;

        const docs = state.documents
          .filter((d) => d.encounterId === found.id)
          .map((d) => ({ ...d, documentType: { code: state.documentType.code } }));

        return {
          ...found,
          patient: state.patient,
          practitioner: { id: found.practitionerId, person: state.patient.person },
          suspensionHour: null,
          diagnoses: found.diagnoses,
          documents: docs,
        };
      }),
    },
    documentTypeCatalog: {
      findUnique: vi.fn(async ({ where }: any) => {
        if (where?.code === state.documentType.code) return state.documentType;
        return null;
      }),
    },
    document: {
      findUnique: vi.fn(async ({ where }: any) => {
        const key = where?.encounterId_documentTypeId;
        if (!key) return null;
        return (
          state.documents.find(
            (doc) => doc.encounterId === key.encounterId && doc.documentTypeId === key.documentTypeId
          ) ?? null
        );
      }),
      create: vi.fn(async ({ data }: any) => {
        const created = {
          id: ++state.documentIdSeq,
          ...data,
          pdfUrl: null,
        };
        state.documents.push(created);
        return created;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const doc = state.documents.find((d) => d.id === where?.id);
        if (!doc) throw new Error("Document not found");
        doc.pdfUrl = data.pdfUrl;
        return { ...doc };
      }),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  };

  return {
    withAuthMock: vi.fn(),
    auditLogMock: vi.fn(),
    putMock: vi.fn(),
    getMock: vi.fn(),
    renderToBufferMock: vi.fn(),
    mapDataMock: vi.fn(),
    prismaMock,
    state,
  };
});

vi.mock("@/shared/auth/auth-guard", () => ({
  withAuth: withAuthMock,
}));

vi.mock("@/shared/audit/audit.service", () => ({
  auditService: {
    log: auditLogMock,
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("@react-pdf/renderer", () => ({
  renderToBuffer: renderToBufferMock,
}));

vi.mock("@/lib/sftp", () => ({
  sftpPut: putMock,
  sftpGet: getMock,
}));

vi.mock("@/features/document/templates", () => ({
  templateRegistry: {
    MEDICAL_CERTIFICATE: {
      component: () => null,
      mapData: mapDataMock,
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  updateTag: vi.fn(),
  cacheTag: vi.fn(),
  revalidatePath: vi.fn(),
  cacheLife: vi.fn(),
}));

import { createEncounter } from "./actions";
import { generateDocumentAction } from "@/features/document/actions";
import { GET as getDocumentRoute } from "@/app/api/encounters/[encounterId]/documents/[documentTypeCode]/route";

describe("critical flow integration: encounter -> document -> route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.encounterIdSeq = 100;
    state.documentIdSeq = 300;
    state.encounters = [];
    state.documents = [];

    withAuthMock.mockImplementation(async (_roles, handler) => handler({ user: { id: "user-cuid-1", email: "test@example.com" } }));
    mapDataMock.mockReturnValue({ patient: "Ana" });
    renderToBufferMock.mockResolvedValue(Buffer.from("pdf-binary"));
    putMock.mockResolvedValue("ruta/generada.pdf");
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3, 4]));
        controller.close();
      },
    });
    getMock.mockResolvedValue(stream);
  });

  it("creates encounter, generates document and serves it through API route", async () => {
    const encounterResult = await createEncounter({
      patientId: 1,
      encounterTypeId: 2,
      medicalAptitudeId: 1,
      diagnoses: [{ icd10CodeId: 123, isPrimary: true }],
      anthropometry: { weight: 70, height: 170 },
    });

    expect(encounterResult.success).toBe(true);
    if (!encounterResult.success) return;
    expect(encounterResult.data).toMatchObject({ id: 101 });

    const documentResult = await generateDocumentAction({
      encounterId: 101,
      documentTypeCode: "MEDICAL_CERTIFICATE",
    });

    expect(documentResult.success).toBe(true);
    if (!documentResult.success) return;
    expect(documentResult.data).toMatchObject({
      encounterId: 101,
      documentTypeId: 77,
      pdfUrl: expect.stringContaining("documentos/"),
    });

    const response = await getDocumentRoute(
      new NextRequest("http://localhost/api/encounters/101/documents/MEDICAL_CERTIFICATE"),
      {
        params: Promise.resolve({ encounterId: "101", documentTypeCode: "MEDICAL_CERTIFICATE" }),
      }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(withAuthMock).toHaveBeenCalledTimes(3);
    expect(auditLogMock).toHaveBeenCalledTimes(2);
    expect(putMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith(expect.stringContaining("documentos/"));
  });
});