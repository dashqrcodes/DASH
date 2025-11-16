import type { NextApiRequest, NextApiResponse } from 'next';

interface VisionVertex {
  x?: number;
  y?: number;
}

interface VisionFaceAnnotation {
  boundingPoly?: { vertices?: VisionVertex[] };
  fdBoundingPoly?: { vertices?: VisionVertex[] };
}

interface VisionResponse {
  responses?: Array<{
    faceAnnotations?: VisionFaceAnnotation[];
    error?: { message: string };
  }>;
}

const getBoundingBox = (annotation: VisionFaceAnnotation) => {
  const vertices =
    annotation.fdBoundingPoly?.vertices ??
    annotation.boundingPoly?.vertices ??
    [];

  if (!vertices.length) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = 0;
  let maxY = 0;

  vertices.forEach((vertex) => {
    const x = vertex.x ?? 0;
    const y = vertex.y ?? 0;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  if (minX === Number.POSITIVE_INFINITY || minY === Number.POSITIVE_INFINITY) {
    return null;
  }

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GOOGLE_VISION_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'GOOGLE_VISION_API_KEY environment variable not set.' });
  }

  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64) {
    return res.status(400).json({ error: 'imageBase64 is required.' });
  }

  try {
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [{ type: 'FACE_DETECTION', maxResults: 3 }],
            },
          ],
        }),
      }
    );

    const data = (await response.json()) as VisionResponse;

    if (!response.ok) {
      const errorMessage =
        data.responses?.[0]?.error?.message ??
        'Vision API request failed.';
      return res.status(response.status).json({ error: errorMessage });
    }

    const annotations = data.responses?.[0]?.faceAnnotations ?? [];

    if (!annotations.length) {
      return res.status(200).json({ face: null });
    }

    const boxes = annotations
      .map((annotation) => getBoundingBox(annotation))
      .filter((box): box is NonNullable<typeof box> => Boolean(box));

    if (!boxes.length) {
      return res.status(200).json({ face: null });
    }

    const largestBox = boxes.reduce((largest, current) => {
      const largestArea = largest.width * largest.height;
      const currentArea = current.width * current.height;
      return currentArea > largestArea ? current : largest;
    });

    return res.status(200).json({ face: largestBox });
  } catch (error) {
    console.error('Vision API error', error);
    return res.status(500).json({ error: 'Vision API request failed.' });
  }
}

