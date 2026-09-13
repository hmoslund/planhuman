// Single source of truth for "premium" status. There is no separate premium column —
// a user is premium purely because users.type === "donar". Anything that needs to
// check premium status (backend route guards, frontend UI) should call this instead
// of comparing `type` itself, so the rule only ever lives in one place.
//
// Safe to import from both server code (API routes) and client components: it has no
// server-only dependencies (no prisma, no next/headers), unlike "@/lib/auth".
export type PremiumCheckSubject = { type?: string | null } | null | undefined;

export function isPremiumUser(user: PremiumCheckSubject): boolean {
  return user?.type === "donar";
}
