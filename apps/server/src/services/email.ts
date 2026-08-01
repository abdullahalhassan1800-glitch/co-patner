import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const APP_URL = process.env.APP_URL || "http://localhost:3001";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

export function isEmailConfigured(): boolean {
  return !!(SMTP_USER && SMTP_PASS);
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<{ delivered: boolean; debugUrl?: string }> {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  const t = getTransporter();
  if (!t) {
    console.log(`[EMAIL-DEV] Password reset link for ${to}: ${resetUrl}`);
    return { delivered: false, debugUrl: resetUrl };
  }

  try {
    await t.sendMail({
      from: `"Co-Patner" <${SMTP_USER}>`,
      to,
      subject: "Reset your Co-Patner password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #111;">Reset your password</h2>
          <p style="color: #555;">Hi,</p>
          <p style="color: #555;">We received a request to reset your Co-Patner password. Click the button below to choose a new one:</p>
          <p style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #7c3aed, #db2777); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: bold; display: inline-block;">Reset Password</a>
          </p>
          <p style="color: #555;">Or copy this link:</p>
          <p style="background: #f5f5f5; border-radius: 8px; padding: 12px; word-break: break-all; color: #333; font-size: 12px;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px;">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
    return { delivered: true };
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    return { delivered: false };
  }
}
