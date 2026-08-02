import { Suspense } from "react";
import { getAuthSession } from "@/shared/auth/auth-guard";
import { DashboardLayoutClient } from "@/shared/components/dashboard-layout-client";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

async function EncountersAuthWrapper({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await getAuthSession();
  } catch (error) {
    redirect("/sign-in");
  }

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

export default function EncountersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-muted/50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <EncountersAuthWrapper>{children}</EncountersAuthWrapper>
    </Suspense>
  );
}
