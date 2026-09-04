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

// In-memory rate limiter for endpoints that don't need durability across restarts
// (login, recovery, forgot-password) — mainly to blunt brute-force guessing and
// bcrypt-compare CPU exhaustion from a flood of requests, not to survive a redeploy.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const SWEEP_INTERVAL_MS = 1000 * 60 * 10;
let lastSweep = Date.now();

function sweepExpiredBuckets(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function checkInMemoryRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  sweepExpiredBuckets(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) return false;
  bucket.count += 1;
  return true;
}
