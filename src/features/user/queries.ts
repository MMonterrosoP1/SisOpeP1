import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { UserFilters, UserListResponse } from "./types";
import { UserRole } from "@/shared/schemas/enums";

export async function getUsers(filters: UserFilters): Promise<UserListResponse> {
  "use cache";
  cacheLife("hours");
  cacheTag("users");

  const page = filters.page || 1;
  const limit = filters.limit || 50;
  const offset = (page - 1) * limit;

  const where: any = {};
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { email: { contains: filters.search } }
    ];
  }

  if (filters.role && filters.role !== "ALL") {
    where.role = filters.role.toUpperCase();
  }

  if (filters.status && filters.status !== "ALL") {
    if (filters.status === "BANNED") {
      where.banned = true;
    } else if (filters.status === "ACTIVE") {
      where.banned = false;
      where.active = true;
    } else if (filters.status === "INACTIVE") {
      where.active = false;
    }
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        practitioner: {
          select: { sex: true, preamble: true, givenNames: true, familyNames: true }
        }
      }
    }),
    prisma.user.count({ where })
  ]);

  return {
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role ? (u.role.toUpperCase() as UserRole) : "VIEWER",
      active: u.active ?? true,
      banned: u.banned ?? false,
      banReason: u.banReason,
      banExpires: u.banExpires ? new Date(u.banExpires) : null,
      emailVerified: u.emailVerified,
      createdAt: new Date(u.createdAt),
      image: u.image,
      preamble: u.practitioner?.preamble,
      sex: u.practitioner?.sex,
      givenNames: u.practitioner?.givenNames,
      familyNames: u.practitioner?.familyNames,
    })),
    total,
    limit,
    offset,
  };
}
