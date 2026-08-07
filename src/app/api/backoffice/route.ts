import { NextResponse } from "next/server";
import { calculateWealth, getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      include: { wealthRecords: true },
      orderBy: { createdAt: "desc" },
    });

    const payload = users.map((entry) => {
      const record = entry.wealthRecords[0];
      const blocks = (record?.blocks as Record<string, Array<{ value?: number | null }>>) ?? {};

      return {
        id: entry.id,
        name: entry.name,
        email: entry.email,
        country: entry.country,
        emailVerified: entry.emailVerified,
        rowCount: Object.values(blocks).reduce((count, rows) => count + (rows?.length ?? 0), 0),
        summary: calculateWealth(blocks),
      };
    });

    return NextResponse.json({ users: payload });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load back office data." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: "User deleted." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete user." }, { status: 500 });
  }
}
