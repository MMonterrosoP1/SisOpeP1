"use server";

import { revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { ActionResponse } from "@/shared/schemas/action-response";
import { handleActionError, AppError } from "@/shared/errors/app-error";
import { withAuth } from "@/shared/auth/auth-guard";
import { safeParseAction } from "@/shared/utils/zod-helpers";
import { createUserSchema, setRoleSchema, banUserSchema, setPasswordSchema, updateDoctorInfoSchema } from "./schemas";
import { UserRole } from "@/shared/schemas/enums";

export async function createUser(data: unknown): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN"], async (s) => s);

    const parseResult = safeParseAction(createUserSchema, data);
    if (!parseResult.success) return parseResult;

    const { name, email, password, role, sex, preamble, givenNames, familyNames } = parseResult.data;

    let practitionerId: number | undefined;

    const newUser = await auth.api.createUser({
      body: {
        email,
        password,
        name,
        role: role as any, // Bypass strict better-auth type to match Prisma enum
      },
    });

    await prisma.user.update({
      where: { id: newUser.user.id },
      data: {
        role: role as UserRole,
        active: true,
      }
    });

    // If role is DOCTOR, create Practitioner
    if (role === "DOCTOR" && sex && givenNames && familyNames) {
      await prisma.practitioner.create({
        data: {
          userId: newUser.user.id,
          givenNames,
          familyNames,
          sex,
          preamble,
          createdBy: session.user.email,
          updatedBy: session.user.email,
        }
      });
    }

    revalidateTag("users", "max");
    return { success: true, data: newUser.user };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateDoctorInfo(data: unknown): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN"], async (s) => s);

    const parseResult = safeParseAction(updateDoctorInfoSchema, data);
    if (!parseResult.success) return parseResult;

    const { userId, sex, preamble, givenNames, familyNames } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { practitioner: true }
    });

    if (!user) throw new AppError("Usuario no encontrado", "NOT_FOUND", 404);
    if (user.role !== "DOCTOR") throw new AppError("El usuario no es un doctor", "BAD_REQUEST", 400);

    // Update or create practitioner
    if (user.practitioner) {
      await prisma.practitioner.update({
        where: { id: user.practitioner.id },
        data: {
          sex,
          givenNames,
          familyNames,
          preamble,
          updatedBy: session.user.email
        }
      });
    } else {
      await prisma.practitioner.create({
        data: {
          userId,
          givenNames,
          familyNames,
          sex,
          preamble,
          createdBy: session.user.email,
          updatedBy: session.user.email,
        }
      });
    }

    revalidateTag("users", "max");
    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setUserRole(data: unknown): Promise<ActionResponse<any>> {
  try {
    await withAuth(["ADMIN"], async (s) => s);

    const parseResult = safeParseAction(setRoleSchema, data);
    if (!parseResult.success) return parseResult;

    const { userId, role } = parseResult.data;

    await auth.api.setRole({
      headers: await headers(),
      body: {
        userId,
        role: role as any,
      }
    });
    
    // Also update our database enum directly just to be safe with types
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole }
    });

    revalidateTag("users", "max");
    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function banUser(data: unknown): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN"], async (s) => s);

    const parseResult = safeParseAction(banUserSchema, data);
    if (!parseResult.success) return parseResult;

    const { userId, banReason, banExpiresIn } = parseResult.data;
    
    if (userId === session.user.id) {
      throw new AppError("No puedes banearte a ti mismo", "BAD_REQUEST", 400);
    }

    await auth.api.banUser({
      headers: await headers(),
      body: {
        userId,
        banReason: banReason || undefined,
        banExpiresIn: banExpiresIn || undefined,
      }
    });

    revalidateTag("users", "max");
    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function unbanUser(userId: string): Promise<ActionResponse<any>> {
  try {
    await withAuth(["ADMIN"], async (s) => s);

    await auth.api.unbanUser({
      headers: await headers(),
      body: {
        userId,
      }
    });

    revalidateTag("users", "max");
    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function toggleUserActive(userId: string): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN"], async (s) => s);

    if (userId === session.user.id) {
      throw new AppError("No puedes desactivarte a ti mismo", "BAD_REQUEST", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { active: true }
    });

    if (!user) {
      throw new AppError("Usuario no encontrado", "NOT_FOUND", 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { active: !user.active }
    });

    revalidateTag("users", "max");
    return { success: true, data: { active: !user.active } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function revokeAllUserSessions(userId: string): Promise<ActionResponse<any>> {
  try {
    const session = await withAuth(["ADMIN"], async (s) => s);

    if (userId === session.user.id) {
      throw new AppError("No puedes revocar tus propias sesiones desde aquí", "BAD_REQUEST", 400);
    }

    await auth.api.revokeUserSessions({
      headers: await headers(),
      body: {
        userId,
      }
    });

    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setUserPassword(data: unknown): Promise<ActionResponse<any>> {
  try {
    await withAuth(["ADMIN"], async (s) => s);

    const parseResult = safeParseAction(setPasswordSchema, data);
    if (!parseResult.success) return parseResult;

    const { userId, newPassword } = parseResult.data;

    await auth.api.setUserPassword({
      headers: await headers(),
      body: {
        userId,
        newPassword,
      }
    });

    return { success: true, data: { success: true } };
  } catch (error) {
    return handleActionError(error);
  }
}
