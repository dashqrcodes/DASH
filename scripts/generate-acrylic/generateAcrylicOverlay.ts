import { createCanvas, loadImage } from "canvas";
import { writeFileSync } from "fs";
import path from "path";
import {
  CANVAS_1X,
  CANVAS_2X,
  BLOCK_SCALE,
  SHADOW_OPACITY,
  SHADOW_BLUR,
  REFRACTION,
} from "./maskConfig";

async function generateOverlay(resolution: number, outputName: string) {
  const basePath = path.join(__dirname, "acrylicBaseV2.png");
  const baseImg = await loadImage(basePath);

  const canvas = createCanvas(resolution, resolution);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, resolution, resolution);

  const blockSize = resolution * BLOCK_SCALE;
  const blockX = (resolution - blockSize) / 2;
  const blockY = (resolution - blockSize) / 2;

  ctx.globalAlpha = SHADOW_OPACITY;
  ctx.filter = `blur(${SHADOW_BLUR}px)`;
  ctx.fillStyle = "rgba(0,0,0,1)";
  ctx.beginPath();
  ctx.ellipse(
    resolution / 2,
    blockY + blockSize * 1.02,
    blockSize * 0.45,
    blockSize * 0.12,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.filter = "none";

  ctx.drawImage(baseImg, blockX, blockY, blockSize, blockSize);

  const maskCanvas = createCanvas(resolution, resolution);
  const maskCtx = maskCanvas.getContext("2d");

  maskCtx.fillStyle = "black";
  maskCtx.fillRect(0, 0, resolution, resolution);

  const windowSize = blockSize * 0.7;
  const windowX = blockX + (blockSize - windowSize) / 2;
  const windowY = blockY + (blockSize - windowSize) / 2;

  maskCtx.globalCompositeOperation = "destination-out";
  maskCtx.fillStyle = "white";
  maskCtx.fillRect(windowX, windowY, windowSize, windowSize);

  ctx.drawImage(maskCanvas, 0, 0);

  const outPath = path.join(__dirname, outputName);
  writeFileSync(outPath, canvas.toBuffer("image/png"));
  console.log("Generated:", outputName);

  return {
    x: windowX,
    y: windowY,
    width: windowSize,
    height: windowSize,
  };
}

async function run() {
  console.log("Generating acrylic overlays...");

  const coords1x = await generateOverlay(CANVAS_1X, "acrylic-6x6-v2.png");
  const coords2x = await generateOverlay(CANVAS_2X, "acrylic-6x6-v2@2x.png");

  console.log("INTERIOR WINDOW (1X):", coords1x);
  console.log("INTERIOR WINDOW (2X):", coords2x);
}

run();

