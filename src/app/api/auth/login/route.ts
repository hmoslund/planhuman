import { NextResponse } from "next/server";
import { createSessionForUser, getCurrency, isAdminEmail, setSessionCookie, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: "No account found for that email." }, { status: 404 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
    }

    if (isAdminEmail(user.email) && !user.isAdmin) {
      await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
      user.isAdmin = true;
    }

    const { token } = await createSessionForUser(user.id);
    const response = NextResponse.json({
      message: "Signed in.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        country: user.country,
        currency: getCurrency(user.country),
        emailVerified: user.emailVerified,
        isAdmin: user.isAdmin,
      },
    });

    return setSessionCookie(response, token);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
