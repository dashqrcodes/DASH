import type { NextApiRequest, NextApiResponse } from 'next';

interface VisionVertex {
  x?: number;
  y?: number;
}

interface VisionTextAnnotation {
  boundingPoly?: { vertices?: VisionVertex[] };
}

interface VisionResponse {
  responses?: Array<{
    fullTextAnnotation?: {
      pages?: Array<{
        blocks?: Array<{
          boundingBox?: { vertices?: VisionVertex[] };
        }>;
      }>;
    };
    textAnnotations?: VisionTextAnnotation[];
    error?: { message: string };
  }>;
}

const getDocumentBounds = (response: VisionResponse) => {
  const annotations = response.responses?.[0];
  if (!annotations) return null;

  // Try to get document bounds from fullTextAnnotation (more accurate)
  const pages = annotations.fullTextAnnotation?.pages;
  if (pages && pages.length > 0) {
    const blocks = pages[0].blocks;
    if (blocks && blocks.length > 0) {
      const vertices = blocks[0].boundingBox?.vertices;
      if (vertices && vertices.length >= 4) {
        return vertices;
      }
    }
  }

  // Fallback to textAnnotations (less accurate but still works)
  const textAnnotations = annotations.textAnnotations;
  if (textAnnotations && textAnnotations.length > 0) {
    // First annotation is usually the entire document
    const vertices = textAnnotations[0].boundingPoly?.vertices;
    if (vertices && vertices.length >= 4) {
      return vertices;
    }
  }

  return null;
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
              features: [
                { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
                { type: 'IMAGE_PROPERTIES', maxResults: 1 },
              ],
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

    const vertices = getDocumentBounds(data);

    if (!vertices || vertices.length < 4) {
      return res.status(200).json({ 
        document: null,
        message: 'No document edges detected. Try adjusting lighting or angle.'
      });
    }

    // Normalize vertices (ensure we have x and y)
    const normalizedVertices = vertices.map(v => ({
      x: v.x ?? 0,
      y: v.y ?? 0
    }));

    return res.status(200).json({ 
      document: {
        vertices: normalizedVertices
      }
    });
  } catch (error) {
    console.error('Vision API error', error);
    return res.status(500).json({ error: 'Vision API request failed.' });
  }
}

