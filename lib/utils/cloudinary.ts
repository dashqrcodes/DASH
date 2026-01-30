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
