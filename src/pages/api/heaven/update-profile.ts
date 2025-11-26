import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

/**
 * Update or create a heaven profile in JSON file
 * POST /api/heaven/update-profile
 * Body: { slug: 'kobe-bryant', name: 'Kobe Bryant', videoUrl: 'https://...' }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { slug, name, videoUrl } = req.body;

    if (!slug) {
      return res.status(400).json({ 
        message: 'Missing slug',
        example: { slug: 'kobe-bryant', name: 'Kobe Bryant', videoUrl: 'https://...' }
      });
    }

    const filePath = path.join(process.cwd(), 'public', 'heaven-profiles.json');
    
    // Read existing profiles
    let profiles = { profiles: [] };
    
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      profiles = JSON.parse(fileContents);
    }

    // Find existing profile or create new
    const existingIndex = profiles.profiles.findIndex((p: any) => p.slug === slug);
    const profileData = {
      slug: slug.toLowerCase(),
      name: name || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      videoUrl: videoUrl || '',
      updatedAt: new Date().toISOString(),
      ...(existingIndex === -1 ? { createdAt: new Date().toISOString() } : {})
    };

    if (existingIndex >= 0) {
      profiles.profiles[existingIndex] = { ...profiles.profiles[existingIndex], ...profileData };
    } else {
      profiles.profiles.push(profileData);
    }

    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(profiles, null, 2), 'utf8');

    return res.status(200).json({
      success: true,
      profile: profileData,
      url: `/heaven/${slug.toLowerCase()}`,
      message: 'Profile saved successfully',
    });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
}
