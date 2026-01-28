type FaceCropOptions = {
  aspectRatio?: string;
  width?: number;
  height?: number;
  gravity?: "face" | "faces";
};

const CLOUDINARY_IMAGE_UPLOAD_SEGMENT = "/image/upload/";

export function buildCloudinaryFaceCropUrl(url: string, options: FaceCropOptions = {}) {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const markerIndex = url.indexOf(CLOUDINARY_IMAGE_UPLOAD_SEGMENT);
  if (markerIndex === -1) return url;

  const prefix = url.slice(0, markerIndex + CLOUDINARY_IMAGE_UPLOAD_SEGMENT.length);
  const rest = url.slice(markerIndex + CLOUDINARY_IMAGE_UPLOAD_SEGMENT.length);
  if (!rest) return url;

  const firstSegment = rest.split("/")[0];
  if (!firstSegment || !firstSegment.startsWith("v")) {
    // URL already has transformations applied.
    return url;
  }

  const gravity = options.gravity ?? "faces";
  const transforms = [
    "c_fill",
    `g_${gravity}`,
    options.aspectRatio ? `ar_${options.aspectRatio}` : "",
    options.width ? `w_${options.width}` : "",
    options.height ? `h_${options.height}` : "",
  ]
    .filter(Boolean)
    .join(",");

  if (!transforms) return url;
  return `${prefix}${transforms}/${rest}`;
}

export function buildCloudinaryTransformUrl(url: string, transform: string) {
  if (!url || !transform || !url.includes("res.cloudinary.com")) return url;

  const markerIndex = url.indexOf(CLOUDINARY_IMAGE_UPLOAD_SEGMENT);
  if (markerIndex === -1) return url;

  const prefix = url.slice(0, markerIndex + CLOUDINARY_IMAGE_UPLOAD_SEGMENT.length);
  const rest = url.slice(markerIndex + CLOUDINARY_IMAGE_UPLOAD_SEGMENT.length);
  if (!rest) return url;

  const firstSegment = rest.split("/")[0];
  if (!firstSegment || !firstSegment.startsWith("v")) {
    return url;
  }

  return `${prefix}${transform}/${rest}`;
}
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File, folder: string = 'memorials') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: folder,
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}

export async function uploadVideo(file: File, folder: string = 'memorials') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: folder,
        transformation: [
          { quality: 'auto:best' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
}
