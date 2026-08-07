import { redirect } from "next/navigation";
import { HomeClient } from "@/components/home-client";
import { getCurrentUserFromCookies } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUserFromCookies();
  if (user) {
    redirect("/dashboard");
  }

  return <HomeClient />;
}
