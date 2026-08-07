import { redirect } from "next/navigation";
import { BackofficeClient } from "@/components/backoffice-client";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default async function BackofficePage() {
  const user = await getCurrentUserFromCookies();
  if (!user || !user.isAdmin) {
    redirect("/dashboard");
  }

  return <BackofficeClient />;
}
