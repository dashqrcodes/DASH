// Enhanced QR code generator with photo color analysis
// Generates 0.75"x0.75" QR code for 6"x6" acrylic template
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import { Vibrant } from 'node-vibrant/node';
import type { Palette } from '@vibrant/color';
import { Buffer } from 'node:buffer';

// Template dimensions (6"x6" at 300 DPI = 1800x1800px)
const TEMPLATE_SIZE = 1800; // 6 inches at 300 DPI
const QR_SIZE = 225; // 0.75 inches at 300 DPI (0.75 * 300)
const QR_MARGIN = 30; // Margin from bottom-left corner (0.1" at 300 DPI)

// Extract colors from photo and pick complementary QR code colors
function extractPhotoColors(buffer: Buffer): Promise<{ dark: string; light: string; logoBg: string; logoText: string }> {
  return Vibrant.from(buffer)
    .getPalette()
    .then((palette: Palette) => {
      // Pick vibrant colors from photo
      const vibrant = palette.Vibrant?.hex || '#000000';
      const lightVibrant = palette.LightVibrant?.hex || '#ffffff';
      const darkVibrant = palette.DarkVibrant?.hex || '#000000';
      const muted = palette.Muted?.hex || '#808080';

      // Convert to RGB for brightness calculation
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : { r: 0, g: 0, b: 0 };
      };

      const vibrantRgb = hexToRgb(vibrant);
      const brightness = (vibrantRgb.r * 0.299 + vibrantRgb.g * 0.587 + vibrantRgb.b * 0.114) / 255;

      // Choose QR code colors that complement the photo
      // Use vibrant color for dark modules, ensure good contrast
      let qrDark = vibrant;
      let qrLight = '#ffffff'; // White background for QR code
      let logoBg = vibrant;
      let logoText = brightness > 0.5 ? '#000000' : '#ffffff'; // Dark text on light bg, light text on dark bg

      // If vibrant color is too light, use dark vibrant instead
      if (brightness > 0.7) {
        qrDark = darkVibrant || muted || '#000000';
        logoBg = darkVibrant || muted || '#000000';
        logoText = '#ffffff';
      }

      // Ensure minimum contrast for QR code readability
      const darkRgb = hexToRgb(qrDark);
      const darkBrightness = (darkRgb.r * 0.299 + darkRgb.g * 0.587 + darkRgb.b * 0.114) / 255;
      
      if (darkBrightness > 0.4) {
        // Too light, darken it
        qrDark = darkVibrant || '#000000';
        logoBg = darkVibrant || '#000000';
        logoText = '#ffffff';
      }

      return {
        dark: qrDark,
        light: qrLight,
        logoBg: logoBg,
        logoText: logoText,
      };
    })
    .catch(() => {
      // Fallback colors if extraction fails
      return {
        dark: '#000000',
        light: '#ffffff',
        logoBg: '#000000',
        logoText: '#ffffff',
      };
    });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const url = formData.get('url') as string;
    const photoFile = formData.get('photo') as File | null;
    const photoUrl = formData.get('photoUrl') as string | null;

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: 'URL is required',
        },
        { status: 400 }
      );
    }

    // Extract colors from photo
    let colors = {
      dark: '#000000',
      light: '#ffffff',
      logoBg: '#000000',
      logoText: '#ffffff',
    };

    if (photoFile) {
      const buffer = Buffer.from(await photoFile.arrayBuffer());
      colors = await extractPhotoColors(buffer);
    } else if (photoUrl) {
      // Fetch photo from URL
      const response = await fetch(photoUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      colors = await extractPhotoColors(buffer);
    }

    // Generate QR code with extracted colors
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: QR_SIZE,
      margin: 1,
      color: {
        dark: colors.dark,
        light: colors.light,
      },
      errorCorrectionLevel: 'H', // High error correction for logo in center
    });

    // Create canvas for QR code with logo
    const qrCanvas = createCanvas(QR_SIZE, QR_SIZE);
    const qrCtx = qrCanvas.getContext('2d');
    const qrImg = await loadImage(qrDataUrl);
    qrCtx.drawImage(qrImg, 0, 0);

    // Add "DASH" logo in center (rounded square background)
    const centerX = QR_SIZE / 2;
    const centerY = QR_SIZE / 2;
    const logoSize = QR_SIZE * 0.2; // 20% of QR code size
    const cornerRadius = QR_SIZE * 0.03; // 3% corner radius

    // Draw rounded square background for logo
    qrCtx.fillStyle = colors.logoBg;
    qrCtx.beginPath();
    qrCtx.roundRect(
      centerX - logoSize / 2,
      centerY - logoSize / 2,
      logoSize,
      logoSize,
      cornerRadius
    );
    qrCtx.fill();

    // Add "DASH" text
    qrCtx.fillStyle = colors.logoText;
    qrCtx.font = `bold ${QR_SIZE * 0.08}px Arial`; // Responsive font size
    qrCtx.textAlign = 'center';
    qrCtx.textBaseline = 'middle';
    qrCtx.fillText('DASH', centerX, centerY);

    // Create final 6"x6" template canvas
    const templateCanvas = createCanvas(TEMPLATE_SIZE, TEMPLATE_SIZE);
    const templateCtx = templateCanvas.getContext('2d');

    // Fill with white background
    templateCtx.fillStyle = '#ffffff';
    templateCtx.fillRect(0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE);

    // Load holiday mockup background if available
    let mockupImg: any = null;
    try {
      // Try to load mockup from public folder
      mockupImg = await loadImage('/mockup-holiday.jpg');
    } catch (e) {
      // Mockup not found, will use white background
    }

    // Draw background (mockup or white)
    if (mockupImg) {
      // Scale mockup to fit template
      templateCtx.drawImage(mockupImg, 0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE);
    } else {
      // Fallback: white background
      templateCtx.fillStyle = '#ffffff';
      templateCtx.fillRect(0, 0, TEMPLATE_SIZE, TEMPLATE_SIZE);
    }

    // If photo provided, overlay it onto the acrylic block area
    // The acrylic block in the mockup is roughly centered, adjust positioning as needed
    if (photoFile || photoUrl) {
      let photoImg: any;
      if (photoFile) {
        const buffer = Buffer.from(await photoFile.arrayBuffer());
        photoImg = await loadImage(buffer);
      } else if (photoUrl) {
        photoImg = await loadImage(photoUrl);
      }

      if (photoImg) {
        // Position photo in center area (where acrylic block would be)
        // Adjust these values based on your mockup
        const acrylicArea = {
          x: TEMPLATE_SIZE * 0.2, // 20% from left
          y: TEMPLATE_SIZE * 0.15, // 15% from top
          width: TEMPLATE_SIZE * 0.6, // 60% width
          height: TEMPLATE_SIZE * 0.7, // 70% height
        };

        // Calculate dimensions to fit acrylic area (maintaining aspect ratio)
        const photoAspect = photoImg.width / photoImg.height;
        const areaAspect = acrylicArea.width / acrylicArea.height;
        
        let drawWidth = acrylicArea.width;
        let drawHeight = acrylicArea.height;
        let offsetX = acrylicArea.x;
        let offsetY = acrylicArea.y;

        if (photoAspect > areaAspect) {
          // Photo is wider: fit to width
          drawHeight = acrylicArea.width / photoAspect;
          offsetY = acrylicArea.y + (acrylicArea.height - drawHeight) / 2;
        } else {
          // Photo is taller: fit to height
          drawWidth = acrylicArea.height * photoAspect;
          offsetX = acrylicArea.x + (acrylicArea.width - drawWidth) / 2;
        }

        templateCtx.drawImage(photoImg, offsetX, offsetY, drawWidth, drawHeight);
      }
    }

    // Position QR code at bottom left (0.75"x0.75")
    const qrX = QR_MARGIN;
    const qrY = TEMPLATE_SIZE - QR_SIZE - QR_MARGIN;
    templateCtx.drawImage(qrCanvas, qrX, qrY);

    // Convert to data URL
    const finalDataUrl = templateCanvas.toDataURL('image/png');

    return NextResponse.json({
      success: true,
      qrCode: finalDataUrl,
      qrCodeOnly: qrCanvas.toDataURL('image/png'), // QR code alone for overlay
      colors: colors,
    });
  } catch (error: any) {
    console.error('Error generating QR code with colors:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Error generating QR code',
      },
      { status: 500 }
    );
  }
}

