const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: unknown, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // No key configured (e.g. local dev) — don't block signups in non-production.
    const allow = process.env.NODE_ENV !== "production";
    if (!allow) {
      console.error("[signup:turnstile] TURNSTILE_SECRET_KEY is not set — blocking all signups in production");
    }
    return allow;
  }

  if (typeof token !== "string" || !token) {
    console.error("[signup:turnstile] no token submitted by client (widget likely didn't render or wasn't completed)", {
      ip,
    });
    return false;
  }

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
    });

    const data = await response.json();
    if (data.success !== true) {
      console.error("[signup:turnstile] Cloudflare rejected the token", {
        ip,
        errorCodes: data["error-codes"],
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error("[signup:turnstile] siteverify request threw", error);
    return false;
  }
}
