import { auditRepository } from "./audit.repository";
import { AuditAction } from "../schemas/enums";
import { headers } from "next/headers";
import { after } from "next/server";

export type CreateAuditLogParams = {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string | number;
  previousData?: any;
  newData?: any;
  description?: string;
};

export const auditService = {
  async log(params: CreateAuditLogParams) {
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    try {
      const headersList = await headers();
      ipAddress =
        headersList.get("x-forwarded-for") ||
        headersList.get("x-real-ip") ||
        null;
      userAgent = headersList.get("user-agent") || null;
    } catch (err) {
      // Might throw if called outside request context (e.g., background job without headers)
      console.warn("[Audit Service] Could not retrieve headers");
    }

    // Use Next.js after() to execute this non-blocking
    after(async () => {
      try {
        await auditRepository.create({
          userId: params.userId,
          action: params.action,
          entityType: params.entityType,
          entityId: String(params.entityId),
          previousData: params.previousData ? JSON.parse(JSON.stringify(params.previousData)) : null,
          newData: params.newData ? JSON.parse(JSON.stringify(params.newData)) : null,
          description: params.description,
          ipAddress,
          userAgent,
        });
      } catch (error) {
        console.error("[Audit Service] Failed to create audit log:", error);
      }
    });
  },
};
