import { NextResponse } from "next/server";
import { issueResetToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendMail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ message: "If the email exists, a reset link will be sent." });
    }

    const token = await issueResetToken(user.id);
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "Reset your WealthPlanner password",
      html: `<p>Use this link to reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    return NextResponse.json({ message: "If the email exists, a reset link will be sent.", resetUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Password reset failed." }, { status: 500 });
  }
}
