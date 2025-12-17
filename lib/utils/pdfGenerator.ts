import { createCanvas, loadImage } from 'canvas';
import QRCode from 'qrcode';
import { Buffer } from 'node:buffer';
import PDFDocument from 'pdfkit';

export interface AcrylicPDFOptions {
  slug: string;
  photoUrl: string;
  qrUrl: string;
  muxPlaybackId?: string | null;
}

export async function generateAcrylicPDF(options: AcrylicPDFOptions): Promise<Buffer> {
  const { photoUrl, qrUrl } = options;

  // Create PDF document (6"x6" at 300 DPI = 1800x1800 points)
  const doc = new PDFDocument({
    size: [1800, 1800], // 6"x6" at 300 DPI
    margin: 0,
  });

  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  // White background
  doc.rect(0, 0, 1800, 1800).fill('#FFFFFF');

  // Load and draw photo (centered, maintaining aspect ratio)
  try {
    const photoImg = await loadImage(photoUrl) as any;
    const photoAspect = photoImg.width / photoImg.height;
    const templateAspect = 1; // Square template

    let drawWidth = 1800;
    let drawHeight = 1800;
    let offsetX = 0;
    let offsetY = 0;

    if (photoAspect > templateAspect) {
      // Photo is wider: fit to width
      drawHeight = 1800 / photoAspect;
      offsetY = (1800 - drawHeight) / 2;
    } else {
      // Photo is taller: fit to height
      drawWidth = 1800 * photoAspect;
      offsetX = (1800 - drawWidth) / 2;
    }

    doc.image(photoImg as any, offsetX, offsetY, {
      width: drawWidth,
      height: drawHeight,
      fit: [drawWidth, drawHeight],
    });
  } catch (error) {
    console.error('Failed to load photo for PDF:', error);
    // Continue without photo
  }

  // Generate QR code
  try {
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 225, // 0.75" at 300 DPI
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });

      // Load QR code image
    const qrImg = await loadImage(qrDataUrl) as any;

    // Position QR code at bottom-left (0.75"x0.75", 0.1" margin)
    const qrSize = 225;
    const qrMargin = 30;
    const qrX = qrMargin;
    const qrY = 1800 - qrSize - qrMargin;

    doc.image(qrImg, qrX, qrY, {
      width: qrSize,
      height: qrSize,
    });
  } catch (error) {
    console.error('Failed to generate QR code for PDF:', error);
    // Continue without QR code
  }

  // Finalize PDF
  doc.end();

  // Wait for PDF to finish generating
  return new Promise((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);
  });
}

