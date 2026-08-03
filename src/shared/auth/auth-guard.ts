import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { UserRole } from "../schemas/enums";
import { ForbiddenError, UnauthorizedError } from "../errors/app-error";

export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (!session) {
    throw new UnauthorizedError("Not authenticated");
  }
  
  return session;
}

export async function requireActiveUser() {
  const session = await getAuthSession();
  
  const user = session.user as typeof session.user & { banned?: boolean; active?: boolean };
  if (user.banned) {
    throw new ForbiddenError("User is banned");
  }
  if (user.active === false) {
    throw new ForbiddenError("User is inactive");
  }
  
  return session;
}

export async function requireRole(...allowedRoles: UserRole[]) {
  const session = await requireActiveUser();
  
  if (!allowedRoles.includes(session.user.role as UserRole)) {
    throw new ForbiddenError("Insufficient permissions");
  }
  
  return session;
}

export async function withAuth<T>(
  allowedRoles: UserRole[],
  handler: (session: Awaited<ReturnType<typeof getAuthSession>>) => Promise<T>
): Promise<T> {
  const session = await requireRole(...allowedRoles);
  return handler(session);
}
