import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendReminderEmail(toEmail, subject, body) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — logging instead of sending:", toEmail, subject, body);
    return { simulated: true };
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM || "ClinicQ <onboarding@resend.dev>",
    to: toEmail,
    subject,
    text: body,
  });

  if (error) {
    console.error("[email] Resend send failed:", error);
    throw new Error(error.message || "Email send failed");
  }
  return data;
}