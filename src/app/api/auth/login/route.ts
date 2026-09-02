import { NextResponse } from "next/server";
import { createSessionForUser, isAdminEmail, normalizeAlias, setSessionCookie, verifyPassword } from "@/lib/auth";
import { normalizeCurrency } from "@/lib/wealth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();
    const value = String(identifier ?? "").trim();

    if (!value || !password) {
      return NextResponse.json({ error: "Alias or email, and password, are required." }, { status: 400 });
    }

    const user = value.includes("@")
      ? await prisma.user.findUnique({ where: { email: value.toLowerCase() } })
      : await prisma.user.findUnique({ where: { alias: normalizeAlias(value) } });

    if (!user) {
      return NextResponse.json({ error: "No account found for that alias or email." }, { status: 404 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (user.email && isAdminEmail(user.email) && !user.isAdmin) {
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
