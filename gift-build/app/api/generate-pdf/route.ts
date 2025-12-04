// PDF Generation API Route
// Isolated to /gift-build folder

import { NextRequest, NextResponse } from 'next/server';
import { generatePDF } from '@/lib/pdfGenerator';

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, qrDataUrl, qrX, qrY, qrSize, reverseMirror } = await request.json();

    if (!photoUrl || !qrDataUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate PDF
    const pdfBytes = await generatePDF({
      photoUrl,
      qrDataUrl,
      qrX: qrX || 10,
      qrY: qrY || 85,
      qrSize: qrSize || 20,
      reverseMirror: reverseMirror || false,
    });

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="timeless-transparency${reverseMirror ? '-mirror' : ''}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

