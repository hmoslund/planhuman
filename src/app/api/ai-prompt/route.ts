import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { isPremiumUser } from "@/lib/premium";
import prisma from "@/lib/prisma";

// Lifetime free uses for non-premium ("donar") users. Premium users are unlimited.
export const FREE_AI_PROMPT_LIMIT = 3;

// There is no AI/LLM call to make here today — "Build AI prompt" just assembles text
// from the user's own already-loaded data in the browser. This endpoint is the one
// place that actually gates and counts a "use" of that feature, so a non-premium user
// can't get more than FREE_AI_PROMPT_LIMIT uses just by ignoring the disabled button.
export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isPremiumUser(user)) {
      const current = await prisma.user.findUnique({
        where: { id: user.id },
        select: { aiPromptCount: true },
      });

      if ((current?.aiPromptCount ?? 0) >= FREE_AI_PROMPT_LIMIT) {
        return NextResponse.json(
          {
            error: "Locked – only for paying users",
            aiPromptCount: current?.aiPromptCount ?? 0,
            limit: FREE_AI_PROMPT_LIMIT,
          },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { aiPromptCount: { increment: 1 } },
      select: { aiPromptCount: true },
    });

    return NextResponse.json({ aiPromptCount: updated.aiPromptCount, limit: FREE_AI_PROMPT_LIMIT });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to record AI prompt use." }, { status: 500 });
  }
}
