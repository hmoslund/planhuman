import { NextResponse } from "next/server";
import { hashToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "A verification token is required." }, { status: 400 });
    }

    const verificationToken = await prisma.emailVerificationToken.findUnique({ where: { token: hashToken(token) } });
    if (!verificationToken || verificationToken.used || verificationToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "This verification link is no longer valid." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: verificationToken.userId }, data: { emailVerified: true } }),
      prisma.emailVerificationToken.update({ where: { id: verificationToken.id }, data: { used: true } }),
    ]);

    return NextResponse.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
