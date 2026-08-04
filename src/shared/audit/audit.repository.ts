import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export const auditRepository = {
  async create(data: Prisma.AuditLogUncheckedCreateInput) {
    return prisma.auditLog.create({
      data,
    });
  },

  async findByEntity(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    });
  },

  async findByUser(userId: string, dateRange?: { from: Date; to: Date }) {
    return prisma.auditLog.findMany({
      where: {
        userId,
        ...(dateRange
          ? {
              createdAt: {
                gte: dateRange.from,
                lte: dateRange.to,
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
      },
    });
  },

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AuditLogWhereInput;
    orderBy?: Prisma.AuditLogOrderByWithRelationInput;
  }) {
    return prisma.auditLog.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy ?? { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  },

  async countMany(where?: Prisma.AuditLogWhereInput) {
    return prisma.auditLog.count({ where });
  },
};
