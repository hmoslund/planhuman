import { NextResponse } from "next/server";
import { createDefaultBlocks, getCurrency, hashPassword, isAdminEmail, issueVerificationToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { sendMail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password, country } = await request.json();

    if (!email || !password || !country) {
      return NextResponse.json({ error: "Email, password, and country are required." }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedCountry = String(country).toUpperCase();

    if (password.length < 8) {
      return NextResponse.json({ error: "Password should be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "An account already exists with that email." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const currency = getCurrency(normalizedCountry);
    // Admin is granted ONLY to the explicitly allowed email addresses (see ADMIN_EMAILS in lib/auth.ts).
    // No wildcard domains are trusted, so a new user can never self-promote to admin.
    const isAdmin = isAdminEmail(normalizedEmail);

    const latest = await prisma.user.aggregate({ _max: { userNumber: true } });
    const userNumber = (latest._max.userNumber ?? 499) + 1;

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: normalizedEmail,
        passwordHash,
        country: normalizedCountry,
        currency,
        userNumber,
        isAdmin,
      },
    });

    const token = await issueVerificationToken(user.id);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verify-email?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "Verify your WealthPlanner account",
      html: `<p>Hi ${user.name ?? "there"},</p><p>Please verify your email by visiting <a href="${verificationUrl}">${verificationUrl}</a>.</p>`,
    });

    await prisma.wealthRecord.create({
      data: {
        userId: user.id,
        blocks: createDefaultBlocks(),
      },
    });

    return NextResponse.json({
      message: "Account created. Please verify your email before saving data.",
      verificationUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        currency: user.currency,
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
        userNumber: user.userNumber,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
