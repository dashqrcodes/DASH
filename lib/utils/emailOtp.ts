import { createHash, randomInt } from "node:crypto";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;

export function generateOtpCode(): string {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH;
  return String(randomInt(min, max));
}

export function getOtpExpiry(): string {
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  return expiresAt.toISOString();
}

export function hashOtp(email: string, code: string, secret?: string): string {
  const base = `${email.toLowerCase().trim()}:${code}:${secret || "otp"}`;
  return createHash("sha256").update(base).digest("hex");
}

export async function sendEmailOtp(options: {
  recipientEmail: string;
  code: string;
}) {
  const { recipientEmail, code } = options;
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@dash.gift",
    to: recipientEmail,
    subject: "Your DASH verification code",
    text: `Your DASH verification code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`,
  });
}
