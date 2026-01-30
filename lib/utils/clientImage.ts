"use client";

import heic2any from "heic2any";

const MAX_WIDTH = 1280;
const MAX_HEIGHT = 720;
const JPEG_QUALITY = 0.8;

export const isHeicFile = (file: File) => {
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    fileExt === "heic" ||
    fileExt === "heif"
  );
};

const loadImageFromBlob = (blob: Blob) => {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(blob).then((bitmap) => ({
      source: bitmap as unknown as CanvasImageSource,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    }));
  }

  return new Promise<{
    source: CanvasImageSource;
    width: number;
    height: number;
    cleanup?: () => void;
  }>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      resolve({
        source: img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        cleanup: () => URL.revokeObjectURL(url),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image."));
    };
    img.src = url;
  });
};

const blobToJpeg = async (file: File) => {
  if (!isHeicFile(file)) return file;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: JPEG_QUALITY });
  return Array.isArray(converted) ? converted[0] : converted;
};

export const convertToJpeg720p = async (file: File) => {
  const normalizedBlob = await blobToJpeg(file);
  const { source, width, height, cleanup } = await loadImageFromBlob(normalizedBlob);
  const scale = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height, 1);
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    cleanup?.();
    throw new Error("Canvas not supported.");
  }
  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  cleanup?.();

  const jpegBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to encode image."));
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });

  const baseName = file.name.replace(/\.[^/.]+$/, "") || "photo";
  return new File([jpegBlob], `${baseName}.jpg`, { type: "image/jpeg" });
};
