export type MockupParams = {
  cloudName: string;
  basePublicId?: string;
  glassOverlayId?: string;
  visitorPhotoUrl: string;
  qrPngUrl: string;
  photoBox?: { x: number; y: number; distort: string; w?: number; h?: number };
  qrBox?: { x: number; y: number; w: number; h: number };
};

/**
 * Builds a Cloudinary URL that warps the visitor photo into a trapezoid and overlays
 * the acrylic glass PNG on top. Adjust coordinates/sizes to match your base mockup.
 */
export function buildAcrylicMockupUrl({
  cloudName,
  basePublicId = 'base-mantel',
  glassOverlayId = 'acrylic-glass-overlay',
  visitorPhotoUrl,
  qrPngUrl,
  photoBox = { x: 210, y: 120, distort: '30:60:880:10:820:520:0:570', w: 860, h: 620 },
  qrBox = { x: 240, y: 520, w: 110, h: 110 },
}: MockupParams) {
  const enc = encodeURIComponent;
  const photoLayer = [
    `l_fetch:${enc(visitorPhotoUrl)}`,
    `c_fill,w_${photoBox.w ?? 860},h_${photoBox.h ?? 620}`,
    `e_distort:${photoBox.distort}`,
    `g_north_west,x_${photoBox.x},y_${photoBox.y}`,
  ].join('/');

  const qrLayer = [
    `l_fetch:${enc(qrPngUrl)}`,
    `c_fit,w_${qrBox.w},h_${qrBox.h}`,
    `g_north_west,x_${qrBox.x},y_${qrBox.y}`,
  ].join('/');

  return [
    `https://res.cloudinary.com/${cloudName}/image/upload`,
    'f_auto,q_auto,w_1200',
    photoLayer,
    qrLayer,
    `l_${glassOverlayId}`,
    `${basePublicId}.png`,
  ].join('/');
}

