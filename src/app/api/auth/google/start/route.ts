import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

// Only request profile, never email — we do not want to store email addresses.
const SCOPES = "openid profile";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Google sign-in is not configured." },
      { status: 500 }
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  // Store state in an httpOnly cookie so the callback can verify it (CSRF protection).
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    path: "/api/auth/google/callback",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
}
