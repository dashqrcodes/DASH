import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    // Generate AI image using Cloudinary
    const result = await cloudinary.uploader.upload(
      `https://res.cloudinary.com/djepgisuk/image/fetch/${encodeURIComponent(
        `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=600`
      )}`
    );
    
    return NextResponse.json({ url: result.secure_url });
  } catch (error: any) {
    console.error('AI generation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
