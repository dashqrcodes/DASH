#!/bin/bash
# Quick script to convert videos to 9:16 aspect ratio
# Usage: ./convert-to-9-16.sh input_video.mp4 [output_name.mp4]

INPUT_FILE="$1"
OUTPUT_FILE="${2:-output_9_16.mp4}"

if [ -z "$INPUT_FILE" ]; then
    echo "Usage: ./convert-to-9-16.sh input_video.mp4 [output_name.mp4]"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File '$INPUT_FILE' not found"
    exit 1
fi

echo "Converting $INPUT_FILE to 9:16 aspect ratio..."
echo "Output: $OUTPUT_FILE"

# Convert to 9:16 (1080x1920 for Full HD)
# This will add black bars if needed to maintain aspect ratio
ffmpeg -i "$INPUT_FILE" \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black" \
  -c:v libx264 \
  -crf 23 \
  -preset medium \
  -c:a copy \
  "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Success! Converted video saved as: $OUTPUT_FILE"
else
    echo "❌ Error: Conversion failed"
    exit 1
fi

