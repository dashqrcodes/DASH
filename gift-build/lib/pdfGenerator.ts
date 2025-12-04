// PDF Generator for 5x7 inch prints
// Isolated to /gift-build folder

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface PDFConfig {
  photoUrl: string;
  qrDataUrl: string;
  qrX: number; // Percentage
  qrY: number; // Percentage
  qrSize: number; // Percentage of page width
  reverseMirror: boolean;
}

/**
 * Generate 5x7 inch 300dpi PDF
 */
export async function generatePDF(config: PDFConfig): Promise<Uint8Array> {
  const { photoUrl, qrDataUrl, qrX, qrY, qrSize, reverseMirror } = config;

  // Create PDF document (5x7 inches at 300dpi)
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([2100, 1500]); // 7in * 300dpi = 2100, 5in * 300dpi = 1500

  // Load photo
  const photoResponse = await fetch(photoUrl);
  const photoBytes = await photoResponse.arrayBuffer();
  let photoImage;
  
  try {
    photoImage = await pdfDoc.embedJpg(photoBytes);
  } catch {
    photoImage = await pdfDoc.embedPng(photoBytes);
  }

  // Draw photo (fill entire page)
  page.drawImage(photoImage, {
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
  });

  // Load QR code
  const qrResponse = await fetch(qrDataUrl);
  const qrBytes = await qrResponse.arrayBuffer();
  const qrImage = await pdfDoc.embedPng(qrBytes);

  // Calculate QR position and size
  const qrWidth = page.getWidth() * (qrSize / 100);
  const qrHeight = qrWidth; // Square QR
  const qrPosX = page.getWidth() * (qrX / 100);
  const qrPosY = page.getHeight() - (page.getHeight() * (qrY / 100)) - qrHeight;

  // Draw QR code
  if (reverseMirror) {
    // For acrylic printing, mirror horizontally
    page.drawImage(qrImage, {
      x: qrPosX + qrWidth,
      y: qrPosY,
      width: -qrWidth, // Negative width mirrors
      height: qrHeight,
    });
  } else {
    page.drawImage(qrImage, {
      x: qrPosX,
      y: qrPosY,
      width: qrWidth,
      height: qrHeight,
    });
  }

  // Generate PDF bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}


