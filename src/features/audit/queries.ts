import { cacheLife, cacheTag } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { auditRepository } from "@/shared/audit/audit.repository";
import { AuditFilters, AuditLogPaginatedResponse } from "./types";

export async function getAuditLogs(
  filters: AuditFilters
): Promise<AuditLogPaginatedResponse> {
  "use cache";
  cacheLife("hours");
  cacheTag("audit-logs");

  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const skip = (page - 1) * limit;

  const where: Prisma.AuditLogWhereInput = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.action) {
    where.action = filters.action;
  }

  if (filters.entityType) {
    where.entityType = filters.entityType;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.createdAt.lte = new Date(filters.endDate);
    }
  }

  if (filters.search) {
    where.description = {
      contains: filters.search,
    };
  }

  const [data, total] = await Promise.all([
    auditRepository.findMany({
      skip,
      take: limit,
      where,
      orderBy: { createdAt: "desc" },
    }),
    auditRepository.countMany(where),
  ]);

  return {
    data: data.map(log => ({
      ...log,
      action: log.action as any,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getAuditStats(dateStr?: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("audit-logs");

  const targetDate = dateStr ? new Date(dateStr) : new Date();
  
  // Set to start of day
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  // Set to end of day
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const whereToday: Prisma.AuditLogWhereInput = {
    createdAt: {
      gte: startOfDay,
      lte: endOfDay,
    }
  };

  const [totalToday, creates, updates, deletes, logins] = await Promise.all([
    auditRepository.countMany(whereToday),
    auditRepository.countMany({ ...whereToday, action: "CREATE" }),
    auditRepository.countMany({ ...whereToday, action: "UPDATE" }),
    auditRepository.countMany({ ...whereToday, action: "DELETE" }),
    auditRepository.countMany({ ...whereToday, action: "LOGIN" }),
  ]);

  return {
    totalToday,
    breakdown: {
      creates,
      updates,
      deletes,
      logins,
    }
  };
}
