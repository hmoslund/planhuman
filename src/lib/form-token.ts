import crypto from "node:crypto";

// Signs a render-time timestamp so the signup route can reject submissions that
// arrive faster than a human could plausibly fill the form (a bot signal), while
// rejecting forged/replayed tokens outside the allowed age window.
const SECRET = process.env.FORM_TOKEN_SECRET || "dev-only-insecure-form-token-secret";
const MIN_AGE_MS = 2000;
const MAX_AGE_MS = 1000 * 60 * 60;

export function issueFormToken() {
  const timestamp = Date.now().toString();
  const signature = crypto.createHmac("sha256", SECRET).update(timestamp).digest("hex");
  return `${timestamp}.${signature}`;
}

export function verifyFormToken(token: unknown) {
  if (typeof token !== "string") {
    console.error("[signup:form-token] missing or non-string token");
    return false;
  }

  const [timestamp, signature] = token.split(".");
  if (!timestamp || !signature) {
    console.error("[signup:form-token] malformed token (expected `timestamp.signature`)");
    return false;
  }

  const expected = crypto.createHmac("sha256", SECRET).update(timestamp).digest("hex");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    console.error("[signup:form-token] signature mismatch (forged/tampered token, or FORM_TOKEN_SECRET differs from the one that issued it)");
    return false;
  }

  const issuedAt = Number(timestamp);
  if (!Number.isFinite(issuedAt)) {
    console.error("[signup:form-token] non-numeric timestamp");
    return false;
  }

  const age = Date.now() - issuedAt;
  if (age < MIN_AGE_MS) {
    console.error(`[signup:form-token] submitted too fast: ${age}ms (min ${MIN_AGE_MS}ms)`);
    return false;
  }
  if (age > MAX_AGE_MS) {
    console.error(`[signup:form-token] token expired: ${age}ms old (max ${MAX_AGE_MS}ms)`);
    return false;
  }
  return true;
}
