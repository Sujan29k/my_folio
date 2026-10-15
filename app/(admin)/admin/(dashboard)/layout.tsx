import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/server/admin-auth";
import DashboardLayout from "./DashboardShell";

export const dynamic = "force-dynamic";

export default function ProtectedDashboard({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) redirect("/admin/login");
  return <DashboardLayout>{children}</DashboardLayout>;
}
