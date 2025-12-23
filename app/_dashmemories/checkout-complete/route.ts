// API route triggered after successful checkout
// Generates PDF and emails to print shop
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { cardDesign, orderId } = await request.json();
    
    if (!cardDesign) {
      return NextResponse.json({ 
        success: false, 
        message: 'Card design data is required' 
      }, { status: 400 });
    }
    
    // Call PDF generation API
    const pdfResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardDesign),
    });
    
    const pdfResult = await pdfResponse.json();
    
    if (pdfResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'PDF generated and sent to print shop successfully',
        orderId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: pdfResult.message || 'Failed to generate PDF' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in checkout complete:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error processing checkout' 
    }, { status: 500 });
  }
}

