import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const { withAuthMock, getDocumentByEncounterAndTypeMock, blobGetMock, prismaMock } = vi.hoisted(() => ({
  withAuthMock: vi.fn(),
  getDocumentByEncounterAndTypeMock: vi.fn(),
  blobGetMock: vi.fn(),
  prismaMock: {
    encounter: { findUnique: vi.fn() }
  }
}));

vi.mock("@/shared/auth/auth-guard", () => ({
  withAuth: withAuthMock,
}));

vi.mock("@/features/document/queries", () => ({
  getDocumentByEncounterAndType: getDocumentByEncounterAndTypeMock,
}));

vi.mock("@/lib/sftp", () => ({
  sftpGet: blobGetMock,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

import { GET } from "./route";

describe("GET /api/encounters/[encounterId]/documents/[documentTypeCode]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withAuthMock.mockImplementation(async (_roles, handler) => handler({ user: { id: "user-1", email: "test@example.com" } }));
    prismaMock.encounter.findUnique.mockResolvedValue({ id: 10 });
  });

  it("returns 400 when params are invalid", async () => {
    const request = new NextRequest("http://localhost/api/encounters/abc/documents/");

    const response = await GET(request, {
      params: Promise.resolve({ encounterId: "abc", documentTypeCode: "" }),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty("error");
    expect(getDocumentByEncounterAndTypeMock).not.toHaveBeenCalled();
  });

  it("returns 404 when document record does not exist", async () => {
    getDocumentByEncounterAndTypeMock.mockResolvedValueOnce(null);
    const request = new NextRequest("http://localhost/api/encounters/10/documents/MEDICAL_CERTIFICATE");

    const response = await GET(request, {
      params: Promise.resolve({ encounterId: "10", documentTypeCode: "MEDICAL_CERTIFICATE" }),
    });
    const body = await response.json();

    expect(getDocumentByEncounterAndTypeMock).toHaveBeenCalledWith(10, "MEDICAL_CERTIFICATE");
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Documento no encontrado" });
  });

  it("returns 404 when blob stream is not accessible", async () => {
    getDocumentByEncounterAndTypeMock.mockResolvedValueOnce({ id: 1, pdfUrl: "https://blob.test/private.pdf" });
    blobGetMock.mockRejectedValueOnce({ message: "File not found on SFTP server" });

    const request = new NextRequest("http://localhost/api/encounters/10/documents/MEDICAL_CERTIFICATE");
    const response = await GET(request, {
      params: Promise.resolve({ encounterId: "10", documentTypeCode: "MEDICAL_CERTIFICATE" }),
    });
    const body = await response.json();

    expect(blobGetMock).toHaveBeenCalledWith("https://blob.test/private.pdf");
    expect(response.status).toBe(404);
    expect(body).toEqual({ error: "Documento inaccesible" });
  });

  it("returns proxied PDF stream on success", async () => {
    getDocumentByEncounterAndTypeMock.mockResolvedValueOnce({ id: 1, pdfUrl: "https://blob.test/private.pdf" });
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        controller.close();
      },
    });
    blobGetMock.mockResolvedValueOnce(stream);

    const request = new NextRequest("http://localhost/api/encounters/10/documents/MEDICAL_CERTIFICATE");
    const response = await GET(request, {
      params: Promise.resolve({ encounterId: "10", documentTypeCode: "MEDICAL_CERTIFICATE" }),
    });

    expect(withAuthMock).toHaveBeenCalledWith(["ADMIN", "DOCTOR"], expect.any(Function));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("returns 500 when an exception is thrown", async () => {
    withAuthMock.mockRejectedValueOnce(new Error("boom"));
    const request = new NextRequest("http://localhost/api/encounters/10/documents/MEDICAL_CERTIFICATE");

    const response = await GET(request, {
      params: Promise.resolve({ encounterId: "10", documentTypeCode: "MEDICAL_CERTIFICATE" }),
    });
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: "Internal Server Error" });
  });
});