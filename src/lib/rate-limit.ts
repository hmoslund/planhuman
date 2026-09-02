import prisma from "@/lib/prisma";

const WINDOW_MS = 1000 * 60 * 60;
const MAX_SIGNUPS_PER_WINDOW = 5;

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

// Records this attempt and reports whether the IP is still within the signup budget.
export async function checkSignupRateLimit(ip: string) {
  const since = new Date(Date.now() - WINDOW_MS);
  const count = await prisma.signupAttempt.count({ where: { ip, createdAt: { gt: since } } });

  if (count >= MAX_SIGNUPS_PER_WINDOW) {
    return false;
  }

  await prisma.signupAttempt.create({ data: { ip } });
  return true;
}
