import type { NextApiRequest, NextApiResponse } from 'next';
import { uploadPhotoToCloudinary } from '../../../utils/cloudinary';
import formidable from 'formidable';
import fs from 'fs';

// Disable body parsing, we'll handle it with formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse form data
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max
      keepExtensions: true,
    });

    const [fields, files] = await form.parse(req);
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const memorialId = Array.isArray(fields.memorialId) ? fields.memorialId[0] : fields.memorialId;
    const index = Array.isArray(fields.index) ? fields.index[0] : fields.index;

    if (!file || !userId || !memorialId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadPhotoToCloudinary(
      fileBuffer,
      userId,
      memorialId,
      index ? parseInt(index) : undefined
    );

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    if (!cloudinaryUrl) {
      return res.status(500).json({ error: 'Failed to upload to Cloudinary' });
    }

    return res.status(200).json({ url: cloudinaryUrl });
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    return res.status(500).json({ error: error.message || 'Upload failed' });
  }
}

