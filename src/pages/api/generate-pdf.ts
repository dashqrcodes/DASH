// API route to generate PDF from card design and email to print shop
// TODO: Install pdfkit or puppeteer for actual PDF generation:
// npm install pdfkit @types/pdfkit
// or
// npm install puppeteer

import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const cardData = req.body;
    
    // TODO: Generate PDF from cardData using canvas or pdfkit
    // For now, create a placeholder PDF file
    const pdfBuffer = await generatePDF(cardData);
    
    // Email PDF to print shop
    const emailSent = await sendEmailToPrintShop(pdfBuffer, cardData);
    
    if (emailSent) {
      return res.status(200).json({ 
        success: true, 
        message: 'PDF generated and sent to print shop successfully' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send PDF to print shop' 
      });
    }
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error generating PDF' 
    });
  }
}

async function generatePDF(cardData: any): Promise<Buffer> {
  // TODO: Implement PDF generation using canvas or pdfkit
  // This is a placeholder - implement actual PDF generation
  const width = 400; // 4 inches at 100 DPI
  const height = 600; // 6 inches at 100 DPI
  
  // Create canvas for front side
  const frontCanvas = createCanvas(width, height);
  const frontCtx = frontCanvas.getContext('2d');
  
  // Draw white background
  frontCtx.fillStyle = '#FFFFFF';
  frontCtx.fillRect(0, 0, width, height);
  
  // Draw photo if available
  if (cardData.front?.photo) {
    // TODO: Load and draw photo
  }
  
  // Draw text
  frontCtx.fillStyle = '#000000';
  frontCtx.font = '24px Arial';
  frontCtx.textAlign = 'center';
  frontCtx.fillText('In Loving Memory', width / 2, 100);
  frontCtx.fillText(cardData.front?.name || '', width / 2, 150);
  frontCtx.fillText(`${cardData.front?.sunrise || ''} - ${cardData.front?.sunset || ''}`, width / 2, 200);
  
  // Create canvas for back side
  const backCanvas = createCanvas(width, height);
  const backCtx = backCanvas.getContext('2d');
  
  // Draw white background
  backCtx.fillStyle = '#FFFFFF';
  backCtx.fillRect(0, 0, width, height);
  
  // Draw background image if available
  if (cardData.back?.background) {
    // TODO: Load and draw background image
  }
  
  // Draw scripture text
  backCtx.fillStyle = '#000000';
  backCtx.font = '16px Arial';
  backCtx.textAlign = 'center';
  const scripture = cardData.back?.scripture || '';
  const lines = scripture.split('\n');
  lines.forEach((line: string, index: number) => {
    backCtx.fillText(line, width / 2, 100 + (index * 30));
  });
  
  // TODO: Convert canvas to PDF using pdfkit or similar
  // For now, return empty buffer
  return Buffer.from('');
}

async function sendEmailToPrintShop(pdfBuffer: Buffer, cardData: any): Promise<boolean> {
  try {
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
    
    // Email options
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@dashmemories.com',
      to: process.env.PRINT_SHOP_EMAIL || 'david@dashqrcodes.com',
      subject: `New Memorial Card Order - ${cardData.front?.name || 'Unknown'}`,
      text: `A new memorial card order has been received.\n\nName: ${cardData.front?.name}\nSunrise: ${cardData.front?.sunrise}\nSunset: ${cardData.front?.sunset}\n\nPDF attached.`,
      attachments: [
        {
          filename: `memorial-card-${Date.now()}.pdf`,
          content: pdfBuffer,
        },
      ],
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
