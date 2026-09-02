import { redirect } from "next/navigation";
import { HomeClient } from "@/components/home-client";
import { getCurrentUserFromCookies } from "@/lib/auth";
import { issueFormToken } from "@/lib/form-token";

export default async function HomePage() {
  const user = await getCurrentUserFromCookies();
  if (user) {
    redirect("/dashboard");
  }

  return <HomeClient formToken={issueFormToken()} turnstileSiteKey={process.env.TURNSTILE_SITE_KEY ?? null} />;
}
