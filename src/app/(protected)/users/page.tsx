import { getUsers } from "@/features/user/queries";
import { UsersClient } from "@/features/user/components/users-client";
import { UserFilters } from "@/features/user/types";
import { UserRole } from "@/shared/schemas/enums";
import { requireRole } from "@/shared/auth/auth-guard";

export const metadata = {
  title: "Usuarios | PREMED",
  description: "Gestión de usuarios y roles del sistema",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsersPage({ searchParams }: Props) {
  // Solo los administradores pueden acceder a esta página
  await requireRole("ADMIN");

  const params = await searchParams;


  const filters: UserFilters = {
    page: params.page ? parseInt(params.page as string, 10) : 1,
    limit: 50,
    search: params.search as string | undefined,
    role: (params.role as UserRole | "ALL") || undefined,
    status: (params.status as "ACTIVE" | "INACTIVE" | "BANNED" | "ALL") || undefined,
  };

  const usersResponse = await getUsers(filters);

  return <UsersClient data={usersResponse} />;
}
