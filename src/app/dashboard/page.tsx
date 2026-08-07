import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    redirect("/");
  }

  return <DashboardClient />;
}
