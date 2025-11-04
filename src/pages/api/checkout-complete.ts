// API route triggered after successful checkout
// Generates PDF and emails to print shop
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { cardDesign, orderId } = req.body;
    
    if (!cardDesign) {
      return res.status(400).json({ 
        success: false, 
        message: 'Card design data is required' 
      });
    }
    
    // Call PDF generation API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const pdfResponse = await fetch(`${baseUrl}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cardDesign),
    });
    
    const pdfResult = await pdfResponse.json();
    
    if (pdfResult.success) {
      return res.status(200).json({ 
        success: true, 
        message: 'PDF generated and sent to print shop successfully',
        orderId 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: pdfResult.message || 'Failed to generate PDF' 
      });
    }
  } catch (error: any) {
    console.error('Error in checkout complete:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Error processing checkout' 
    });
  }
}
