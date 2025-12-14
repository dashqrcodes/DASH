"use client";

import { useEffect, useRef } from "react";

interface WindowConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  photoUrl: string;
  qrUrl: string;
  baseSrc: string;
  window: WindowConfig;
}

export default function AcrylicMockupCanvas({
  photoUrl,
  qrUrl,
  baseSrc,
  window,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function draw() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const overlay = new Image();
      overlay.src = "/mockups/acrylic-overlay-6x6.png";

      const base = new Image();
      base.src = baseSrc;

      const photo = new Image();
      photo.src = photoUrl;

      const qr = new Image();
      qr.src = qrUrl;

      await Promise.all([
        new Promise((res) => (overlay.onload = res)),
        new Promise((res) => (base.onload = res)),
        new Promise((res) => (photo.onload = res)),
        new Promise((res) => (qr.onload = res)),
      ]);

      const size = canvas.width;

      ctx.clearRect(0, 0, size, size);

      ctx.drawImage(base, 0, 0, size, size);
      ctx.drawImage(photo, window.x, window.y, window.width, window.height);

      const qrSize = window.width * 0.24;
      ctx.drawImage(
        qr,
        window.x + window.width * 0.05,
        window.y + window.height * 0.7,
        qrSize,
        qrSize
      );

      ctx.drawImage(overlay, 0, 0, size, size);
    }

    draw();
  }, [photoUrl, qrUrl, baseSrc, window]);

  return (
    <canvas
      ref={canvasRef}
      width={2048}
      height={2048}
      className="w-full h-auto"
    />
  );
}

