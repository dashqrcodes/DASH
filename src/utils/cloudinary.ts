import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Upload photo to Cloudinary with automatic optimization
 * @param file - Photo file or buffer
 * @param userId - User ID
 * @param memorialId - Memorial ID
 * @param index - Photo index
 */
export async function uploadPhotoToCloudinary(
  file: File | Blob | Buffer,
  userId: string,
  memorialId: string,
  index?: number
): Promise<string | null> {
  try {
    // Convert File/Blob to buffer if needed
    let buffer: Buffer;
    if (file instanceof Buffer) {
      buffer = file;
    } else if (file instanceof Blob || file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      return null;
    }

    // Upload to Cloudinary with optimization
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `memorials/${userId}/${memorialId}`,
          public_id: `photo-${index || Date.now()}`,
          resource_type: 'image',
          transformation: [
            {
              quality: 'auto', // Automatic quality optimization
              fetch_format: 'auto', // Auto WebP/AVIF for modern browsers
              width: 1920,
              height: 1080,
              crop: 'limit', // Don't upscale, but limit max size
            },
          ],
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return null;
  }
}

/**
 * Get optimized thumbnail URL from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param width - Thumbnail width (default: 300)
 */
export function getCloudinaryThumbnail(publicId: string, width: number = 300): string {
  return cloudinary.url(publicId, {
    width,
    height: width,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}
