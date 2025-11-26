import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * Get all heaven profiles from JSON file
 * GET /api/heaven/get-profiles
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Read profiles from public folder
    const filePath = path.join(process.cwd(), 'public', 'heaven-profiles.json');
    
    let profiles = { profiles: [] };
    
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      profiles = JSON.parse(fileContents);
    }

    return res.status(200).json(profiles);

  } catch (error: any) {
    console.error('Error reading profiles:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
