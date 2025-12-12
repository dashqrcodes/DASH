// API route to generate QR code
import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';

export async function POST(request: NextRequest) {
  try {
    const { url, lovedOneName } = await request.json();
    
    if (!url) {
      return NextResponse.json({ 
        success: false, 
        message: 'URL is required' 
      }, { status: 400 });
    }
    
    // Generate QR code as data URL with transparent background
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 1,
      color: {
        dark: '#0A2463', // Dark blue modules
        light: '#00000000' // Transparent background
      },
      errorCorrectionLevel: 'M'
    });
    
    // Load QR code into canvas
    const canvas = createCanvas(300, 300);
    const ctx = canvas.getContext('2d');
    const img = await loadImage(qrDataUrl);
    ctx.drawImage(img, 0, 0);
    
    // Add rounded square with "DASH" in center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const squareSize = 60;
    const cornerRadius = 8;
    
    // Draw rounded square with gradient (transparent center)
    ctx.fillStyle = '#0A2463';
    ctx.beginPath();
    ctx.roundRect(centerX - squareSize/2, centerY - squareSize/2, squareSize, squareSize, cornerRadius);
    ctx.fill();
    
    // Add "DASH" text in white
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DASH', centerX, centerY);
    
    // Convert to data URL with transparency
    const finalQrDataUrl = canvas.toDataURL('image/png');
    
    return NextResponse.json({ 
      success: true, 
      qrCode: finalQrDataUrl 
    });
    
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error generating QR code' 
    }, { status: 500 });
  }
}

