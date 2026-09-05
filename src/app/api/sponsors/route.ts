import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Lean, currency-keyed sponsor data for the dashboard's "sponsored by" block.
// Distinct from /api/backoffice/sponsors, which is the admin management view.
export async function GET(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sponsors = await prisma.sponsor.findMany();
    return NextResponse.json({
      sponsors: Object.fromEntries(
        sponsors.map((sponsor) => [sponsor.currency, { link: sponsor.link, logoData: sponsor.logoData, text: sponsor.text }])
      ),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load sponsors." }, { status: 500 });
  }
}
