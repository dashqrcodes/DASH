import { Buffer } from 'node:buffer';

export async function sendPrintPdfEmail(options: {
  pdfBuffer?: Buffer;
  slug: string;
  recipientEmail: string;
  customerEmail?: string | null;
  subjectPrefix?: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}) {
  const { pdfBuffer, slug, recipientEmail, customerEmail, subjectPrefix, attachments } = options;
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

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@dash.gift',
    to: recipientEmail,
    subject: `${subjectPrefix || 'New Print Order'} - ${slug}`,
    text: `Order ID: ${slug}\nCustomer Email: ${customerEmail || 'N/A'}\n\nPDF attached for printing.`,
    attachments:
      attachments && attachments.length > 0
        ? attachments
        : pdfBuffer
          ? [
              {
                filename: `order-${slug}.pdf`,
                content: pdfBuffer,
              },
            ]
          : [],
  });
}
