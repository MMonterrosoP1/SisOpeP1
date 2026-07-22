import { getAuthSession } from "@/shared/auth/auth-guard";
import { DashboardLayoutClient } from "@/shared/components/dashboard-layout-client";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await getAuthSession();
  } catch (error) {
    redirect("/sign-in");
  }

  // Ensure user has required fields
  const user = {
    id: session.user.id,
    name: session.user.name || "Usuario",
    email: session.user.email,
    role: (session.user as any).role || "VIEWER",
  };

  return (
    <DashboardLayoutClient user={user}>
      {children}
    </DashboardLayoutClient>
  );
}
