// Image enhancement utilities for slideshow creator
// Features: auto-rotation, background detection, edge cropping, glare removal, facial centering, auto zoom

export interface ImageEnhancementOptions {
    autoRotate: boolean;
    detectBackground: boolean;
    edgeCrop: boolean;
    removeGlare: boolean;
    centerFace: boolean;
    autoZoom: boolean;
    targetAspectRatio: number; // 16/9 = 1.777...
}

export interface EnhancedImage {
    original: string;
    enhanced: string;
    metadata: {
        width: number;
        height: number;
        aspectRatio: number;
        rotation: number;
        faceDetected: boolean;
        faceX?: number;
        faceY?: number;
    };
}

// Detect image orientation and auto-rotate
export async function autoRotateImage(imageFile: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Check EXIF orientation (if available)
            // For now, detect based on dimensions
            const isPortrait = img.height > img.width;
            
            // If portrait but should be landscape for 16:9, rotate
            if (isPortrait && img.width < img.height) {
                canvas.width = img.height;
                canvas.height = img.width;
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate(90 * Math.PI / 180);
                ctx.drawImage(img, -img.width / 2, -img.height / 2);
            } else {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
            }

            const rotatedImg = new Image();
            rotatedImg.onload = () => resolve(rotatedImg);
            rotatedImg.onerror = reject;
            rotatedImg.src = canvas.toDataURL();
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(imageFile);
    });
}

// Detect background brightness and edges
export function detectBackgroundBrightness(imageData: ImageData): { brightness: number; hasLightBackground: boolean } {
    const data = imageData.data;
    let brightnessSum = 0;
    let sampleCount = 0;

    // Sample edges (top, bottom, left, right)
    const edgeWidth = Math.floor(imageData.width * 0.1); // 10% of width
    const edgeHeight = Math.floor(imageData.height * 0.1); // 10% of height

    // Sample top edge
    for (let y = 0; y < edgeHeight; y++) {
        for (let x = 0; x < imageData.width; x += 4) {
            const idx = (y * imageData.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            brightnessSum += brightness;
            sampleCount++;
        }
    }

    // Sample bottom edge
    for (let y = imageData.height - edgeHeight; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x += 4) {
            const idx = (y * imageData.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            brightnessSum += brightness;
            sampleCount++;
        }
    }

    // Sample left and right edges
    for (let x = 0; x < edgeWidth; x++) {
        for (let y = 0; y < imageData.height; y += 4) {
            const idx = (y * imageData.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            brightnessSum += brightness;
            sampleCount++;
        }
    }

    for (let x = imageData.width - edgeWidth; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y += 4) {
            const idx = (y * imageData.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            brightnessSum += brightness;
            sampleCount++;
        }
    }

    const avgBrightness = brightnessSum / sampleCount;
    return {
        brightness: avgBrightness,
        hasLightBackground: avgBrightness > 0.6
    };
}

// Simple face detection using brightness patterns (center of image)
export function detectFaceCenter(imageData: ImageData): { x: number; y: number; detected: boolean } {
    const centerX = imageData.width / 2;
    const centerY = imageData.height / 2;
    const searchRadius = Math.min(imageData.width, imageData.height) * 0.3;
    
    // Look for face-like patterns (darker regions in center)
    let maxDarkness = 0;
    let faceX = centerX;
    let faceY = centerY;

    for (let y = centerY - searchRadius; y < centerY + searchRadius; y += 10) {
        for (let x = centerX - searchRadius; x < centerX + searchRadius; x += 10) {
            if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) continue;
            
            const idx = (Math.floor(y) * imageData.width + Math.floor(x)) * 4;
            const r = imageData.data[idx];
            const g = imageData.data[idx + 1];
            const b = imageData.data[idx + 2];
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            const darkness = 1 - brightness;

            if (darkness > maxDarkness) {
                maxDarkness = darkness;
                faceX = x;
                faceY = y;
            }
        }
    }

    return {
        x: faceX,
        y: faceY,
        detected: maxDarkness > 0.3 // Threshold for face detection
    };
}

// Remove glare by detecting and reducing bright spots
export function removeGlare(imageData: ImageData): ImageData {
    const data = new Uint8ClampedArray(imageData.data);
    const threshold = 240; // Brightness threshold for glare

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = r * 0.299 + g * 0.587 + b * 0.114;

        if (brightness > threshold) {
            // Reduce brightness by 30%
            data[i] = Math.min(255, r * 0.7);
            data[i + 1] = Math.min(255, g * 0.7);
            data[i + 2] = Math.min(255, b * 0.7);
        }
    }

    return new ImageData(data, imageData.width, imageData.height);
}

// Auto enhance image with all features
export async function enhanceImage(
    imageFile: File,
    options: Partial<ImageEnhancementOptions> = {}
): Promise<EnhancedImage> {
    const defaultOptions: ImageEnhancementOptions = {
        autoRotate: true,
        detectBackground: true,
        edgeCrop: true,
        removeGlare: true,
        centerFace: true,
        autoZoom: true,
        targetAspectRatio: 16 / 9
    };

    const opts = { ...defaultOptions, ...options };

    // Load and rotate if needed
    let img = await autoRotateImage(imageFile);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Could not get canvas context');
    }

    // Set canvas size
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Get image data
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Detect background
    const bgInfo = detectBackgroundBrightness(imageData);
    
    // Remove glare if needed
    if (opts.removeGlare) {
        imageData = removeGlare(imageData);
    }

    // Detect face center
    const faceInfo = detectFaceCenter(imageData);
    
    // Apply enhancements
    ctx.putImageData(imageData, 0, 0);

    // Auto zoom and crop for 16:9
    if (opts.autoZoom && opts.targetAspectRatio) {
        const currentAspectRatio = canvas.width / canvas.height;
        const targetAspectRatio = opts.targetAspectRatio;

        let newWidth = canvas.width;
        let newHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (currentAspectRatio > targetAspectRatio) {
            // Image is wider than target - crop sides
            newWidth = canvas.height * targetAspectRatio;
            offsetX = (canvas.width - newWidth) / 2;
            
            // Center on face if detected
            if (faceInfo.detected && opts.centerFace) {
                const faceOffset = faceInfo.x - canvas.width / 2;
                offsetX = Math.max(0, Math.min(canvas.width - newWidth, offsetX + faceOffset * 0.5));
            }
        } else {
            // Image is taller than target - crop top/bottom
            newHeight = canvas.width / targetAspectRatio;
            offsetY = (canvas.height - newHeight) / 2;
            
            // Center on face if detected
            if (faceInfo.detected && opts.centerFace) {
                const faceOffset = faceInfo.y - canvas.height / 2;
                offsetY = Math.max(0, Math.min(canvas.height - newHeight, offsetY + faceOffset * 0.5));
            }
        }

        // Create new canvas with target aspect ratio
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        if (!croppedCtx) {
            throw new Error('Could not get cropped canvas context');
        }

        croppedCanvas.width = newWidth;
        croppedCanvas.height = newHeight;
        croppedCtx.drawImage(canvas, offsetX, offsetY, newWidth, newHeight, 0, 0, newWidth, newHeight);

        return {
            original: URL.createObjectURL(imageFile),
            enhanced: croppedCanvas.toDataURL('image/jpeg', 0.9),
            metadata: {
                width: newWidth,
                height: newHeight,
                aspectRatio: newWidth / newHeight,
                rotation: 0,
                faceDetected: faceInfo.detected,
                faceX: faceInfo.detected ? faceInfo.x - offsetX : undefined,
                faceY: faceInfo.detected ? faceInfo.y - offsetY : undefined
            }
        };
    }

    return {
        original: URL.createObjectURL(imageFile),
        enhanced: canvas.toDataURL('image/jpeg', 0.9),
        metadata: {
            width: canvas.width,
            height: canvas.height,
            aspectRatio: canvas.width / canvas.height,
            rotation: 0,
            faceDetected: faceInfo.detected,
            faceX: faceInfo.detected ? faceInfo.x : undefined,
            faceY: faceInfo.detected ? faceInfo.y : undefined
        }
    };
}

// Batch process multiple images
export async function enhanceImages(
    files: File[],
    options?: Partial<ImageEnhancementOptions>
): Promise<EnhancedImage[]> {
    const results = await Promise.all(
        files.map(file => enhanceImage(file, options))
    );
    return results;
}

