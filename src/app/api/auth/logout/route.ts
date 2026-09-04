import { NextResponse } from "next/server";
import { clearSessionCookie, hashToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/wealth-session=([^;]+)/);
    const token = match?.[1];

    if (token) {
      await prisma.session.deleteMany({ where: { token: hashToken(token) } });
    }

    return clearSessionCookie();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
