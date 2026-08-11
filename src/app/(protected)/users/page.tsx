import { getUsers } from "@/features/user/queries";
import { UsersClient } from "@/features/user/components/users-client";
import { UserFilters } from "@/features/user/types";
import { Suspense } from "react";
import { UserRole } from "@/shared/schemas/enums";
import { requireRole } from "@/shared/auth/auth-guard";

export const metadata = {
  title: "Usuarios | PREMED",
  description: "Gestión de usuarios y roles del sistema",
};

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default function UsersPage({ searchParams }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            Administración de cuentas, roles y acceso al sistema.
          </p>
        </div>
      </div>
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-muted-foreground">Cargando usuarios...</div>}>
        <UsersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function UsersContent({ searchParams }: Props) {
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
