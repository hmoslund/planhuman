import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!resend) {
    console.log(`Email disabled. To: ${to}\nSubject: ${subject}\n${html}`);
    return { id: "dev-mode" };
  }

  return resend.emails.send({
    from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
    to,
    subject,
    html,
  });
}
