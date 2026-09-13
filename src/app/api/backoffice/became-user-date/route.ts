import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Returns a Date to save, `null` to clear the field, or `undefined` if the input
// is not a valid "YYYY-MM-DD" string / empty value.
function parseBecameUserDate(value: unknown): Date | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !DATE_ONLY_PATTERN.test(value)) return undefined;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId : null;
    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const becameUserDate = parseBecameUserDate(body.becameUserDate);
    if (becameUserDate === undefined) {
      return NextResponse.json(
        { error: "becameUserDate must be a YYYY-MM-DD date, or empty to clear it." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { becameUserDate },
    });

    return NextResponse.json({ message: "Became-user date updated.", becameUserDate: updated.becameUserDate });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update became-user date." }, { status: 500 });
  }
}
