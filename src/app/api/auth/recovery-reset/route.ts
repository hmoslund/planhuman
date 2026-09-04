import { NextResponse } from "next/server";
import { generateRecoveryCode, hashPassword, normalizeAlias, verifyPassword } from "@/lib/auth";
import { checkInMemoryRateLimit, getClientIp } from "@/lib/rate-limit";
import prisma from "@/lib/prisma";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 1000 * 60 * 15;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkInMemoryRateLimit(`recovery-reset:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const { alias, recoveryCode, password } = await request.json();

    if (!alias || !recoveryCode || !password) {
      return NextResponse.json({ error: "Alias, recovery code, and new password are required." }, { status: 400 });
    }

    if (String(password).length < 8) {
      return NextResponse.json({ error: "Password should be at least 8 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { alias: normalizeAlias(alias) } });
    if (!user || !user.recoveryCodeHash) {
      return NextResponse.json({ error: "Invalid alias or recovery code." }, { status: 400 });
    }

    const valid = await verifyPassword(String(recoveryCode).trim(), user.recoveryCodeHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid alias or recovery code." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const newRecoveryCode = generateRecoveryCode();
    const recoveryCodeHash = await hashPassword(newRecoveryCode);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, recoveryCodeHash },
    });

    return NextResponse.json({
      message: "Password updated. Save your new recovery code below — it replaces the old one, which no longer works.",
      recoveryCode: newRecoveryCode,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Password reset failed." }, { status: 500 });
  }
}
