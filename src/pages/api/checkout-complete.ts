// API route triggered after successful checkout
// Generates PDF and emails to print shop (if not in test mode)
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { cardDesign, posterDesign, orderId, testMode } = req.body;
    
    // Check if we have at least one design
    if (!cardDesign && !posterDesign) {
      return res.status(400).json({ 
        success: false, 
        message: 'Card or poster design data is required' 
      });
    }
    
    // TEST MODE: Skip PDF generation and email sending
    if (testMode === true) {
      console.log('🧪 TEST MODE: Skipping PDF generation and email sending');
      console.log('📦 Order Data:', {
        orderId,
        hasCard: !!cardDesign,
        hasPoster: !!posterDesign,
        cardName: cardDesign?.front?.name,
        posterName: posterDesign?.front?.name
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Order processed successfully (test mode - no email sent)',
        orderId,
        testMode: true
      });
    }
    
    // PRODUCTION MODE: Generate PDFs and send emails
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const pdfPromises = [];
    
    // Generate PDF for card if exists
    if (cardDesign) {
      pdfPromises.push(
        fetch(`${baseUrl}/api/generate-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...cardDesign, orderId }),
        })
      );
    }
    
    // Generate PDF for poster if exists
    if (posterDesign) {
      pdfPromises.push(
        fetch(`${baseUrl}/api/generate-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...posterDesign, orderId }),
        })
      );
    }
    
    // Wait for all PDFs to be generated
    const pdfResults = await Promise.all(pdfPromises);
    const results = await Promise.all(pdfResults.map(r => r.json()));
    
    // Check if all PDFs were generated successfully
    const allSuccess = results.every(r => r.success);
    
    if (allSuccess) {
      return res.status(200).json({ 
        success: true, 
        message: 'PDFs generated and sent to print shop successfully',
        orderId 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to generate some PDFs',
        details: results
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
