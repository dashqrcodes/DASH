import { Buffer } from 'node:buffer';

export async function sendPrintPdfEmail(options: {
  slug: string;
  fullName?: string;
  counselorName?: string;
  recipientEmail: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
  /** Legacy: single PDF for acrylic orders */
  pdfBuffer?: Buffer;
}) {
  const { slug, fullName, counselorName, recipientEmail, attachments, pdfBuffer } = options;
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });

  const displayName = fullName || slug;
  const body = [
    'Groman Mortuary Print Order',
    '',
    `Person: ${displayName}`,
    ...(counselorName ? [`Counselor: ${counselorName}`] : []),
    '',
    'Please print the attached files.',
  ].join('\n');

  const resolvedAttachments =
    attachments && attachments.length > 0
      ? attachments
      : pdfBuffer
        ? [{ filename: `order-${slug}.pdf`, content: pdfBuffer }]
        : [];

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@dash.gift',
    to: recipientEmail,
    subject: `Print Order — ${displayName}`,
    text: body,
    attachments: resolvedAttachments,
  });
}
