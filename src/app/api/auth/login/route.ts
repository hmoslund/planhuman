import { NextResponse } from "next/server";
import { createSessionForUser, hashPassword, isAdminAlias, isAdminEmail, normalizeAlias, setSessionCookie, verifyPassword } from "@/lib/auth";
import { checkInMemoryRateLimit, getClientIp } from "@/lib/rate-limit";
import { normalizeCurrency } from "@/lib/wealth";
import prisma from "@/lib/prisma";

const MAX_LOGIN_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 1000 * 60 * 5;

// Used to run a bcrypt compare even when no account matches, so responding
// "invalid" doesn't come back measurably faster than a real wrong-password
// case — that timing gap would otherwise leak which aliases/emails exist.
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash() {
  if (!dummyHashPromise) dummyHashPromise = hashPassword("timing-safety-placeholder");
  return dummyHashPromise;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkInMemoryRateLimit(`login:${ip}`, MAX_LOGIN_ATTEMPTS, LOGIN_WINDOW_MS)) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
    }

    const { identifier, password } = await request.json();
    const value = String(identifier ?? "").trim();

    if (!value || !password) {
      return NextResponse.json({ error: "Alias or email, and password, are required." }, { status: 400 });
    }

    const user = value.includes("@")
      ? await prisma.user.findUnique({ where: { email: value.toLowerCase() } })
      : await prisma.user.findUnique({ where: { alias: normalizeAlias(value) } });

    const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
    if (!user || !valid) {
      return NextResponse.json({ error: "Invalid alias/email or password." }, { status: 401 });
    }

    const shouldBeAdmin = (user.email && isAdminEmail(user.email)) || (user.alias && isAdminAlias(user.alias));
    if (shouldBeAdmin && !user.isAdmin) {
      await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
      user.isAdmin = true;
    }

    const { token } = await createSessionForUser(user.id);
    const response = NextResponse.json({
      message: "Signed in.",
      user: {
        id: user.id,
        email: user.email,
        alias: user.alias,
        name: user.name,
        country: user.country,
        currency: normalizeCurrency(user.currency),
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        donated: user.donated,
        userNumber: user.userNumber,
      },
    });

    return setSessionCookie(response, token);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
