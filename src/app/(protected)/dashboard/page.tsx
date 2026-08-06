import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Panel de control principal",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      {/* TODO: Add dashboard widgets/cards later */}
    </div>
  );
}
