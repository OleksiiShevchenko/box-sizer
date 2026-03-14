import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const confirmUrl = `${appUrl}/confirm?token=${token}&email=${encodeURIComponent(email)}`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: email,
    subject: "Confirm your Box Sizer account",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to Box Sizer!</h2>
        <p>Please confirm your email address by clicking the link below:</p>
        <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Confirm Email
        </a>
        <p style="margin-top: 16px; color: #6b7280; font-size: 14px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  // Also notify config email about new signup
  const configEmail = process.env.CONFIG_EMAIL;
  if (configEmail) {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: configEmail,
      subject: "New Box Sizer signup",
      html: `<p>New user signed up: <strong>${email}</strong></p>`,
    });
  }
}
