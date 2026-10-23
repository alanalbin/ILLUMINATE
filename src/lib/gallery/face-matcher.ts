/**
 * Biometric Facial Feature Extraction & Matching Utility
 * Client & Server compatible mathematical descriptor implementation
 */

export interface FaceBoundingBox {
  // Normalized 0.0 - 1.0 coordinates [x, y, width, height]
  box: [number, number, number, number];
  descriptor: number[];
}

export interface GalleryPhotoItem {
  id: string;
  name: string;
  src: string;
  thumb: string;
  driveUrl: string;
  driveThumb: string;
  category: string;
  faceCount: number;
  faces: FaceBoundingBox[];
  width: number;
  height: number;
}

export interface MatchResult {
  photo: GalleryPhotoItem;
  score: number; // 0.0 - 1.0
  matchPercentage: number; // 0 - 100
  bestBox?: [number, number, number, number];
}

/**
 * Computes cosine similarity between two descriptor vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom < 1e-6) return 0;
  return dot / denom;
}

/**
 * Extract 128-D normalized biometric vector from canvas pixel data (64x64 grayscale).
 */
export function extractDescriptorFromCanvas(
  canvas: HTMLCanvasElement,
  cropArea?: { x: number; y: number; width: number; height: number }
): number[] {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  const srcX = cropArea ? cropArea.x : 0;
  const srcY = cropArea ? cropArea.y : 0;
  const srcW = cropArea ? cropArea.width : canvas.width;
  const srcH = cropArea ? cropArea.height : canvas.height;

  // Create an offscreen 64x64 canvas
  const offCanvas = document.createElement('canvas');
  offCanvas.width = 64;
  offCanvas.height = 64;
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
  if (!offCtx) return [];

  // Draw scaled face
  offCtx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, 64, 64);
  const imgData = offCtx.getImageData(0, 0, 64, 64);
  const data = imgData.data;

  // Convert to 64x64 2D grayscale array
  const gray: number[][] = [];
  for (let r = 0; r < 64; r++) {
    gray[r] = [];
    for (let c = 0; c < 64; c++) {
      const idx = (r * 64 + c) * 4;
      const g = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      gray[r][c] = g;
    }
  }

  // 1. 32-bin intensity histogram
  const hist = new Float32Array(32);
  for (let r = 0; r < 64; r++) {
    for (let c = 0; c < 64; c++) {
      const bin = Math.min(31, Math.floor(gray[r][c] / 8));
      hist[bin]++;
    }
  }
  let normHist = 0;
  for (let i = 0; i < 32; i++) normHist += hist[i] * hist[i];
  normHist = Math.sqrt(normHist) + 1e-6;
  const normHistVec: number[] = [];
  for (let i = 0; i < 32; i++) normHistVec.push(hist[i] / normHist);

  // 2. 8x8 cell grid averages (64 dimensions)
  const gridMeans: number[] = [];
  for (let r = 0; r < 64; r += 8) {
    for (let c = 0; c < 64; c += 8) {
      let sum = 0;
      for (let dr = 0; dr < 8; dr++) {
        for (let dc = 0; dc < 8; dc++) {
          sum += gray[r + dr][c + dc];
        }
      }
      gridMeans.push(sum / 64);
    }
  }
  let normGrid = 0;
  for (let i = 0; i < gridMeans.length; i++) normGrid += gridMeans[i] * gridMeans[i];
  normGrid = Math.sqrt(normGrid) + 1e-6;
  const normGridVec: number[] = [];
  for (let i = 0; i < gridMeans.length; i++) normGridVec.push(gridMeans[i] / normGrid);

  // 3. Sobel edge gradients (32 dimensions for angles 0 - 360)
  const gradHist = new Float32Array(32);
  for (let r = 1; r < 63; r++) {
    for (let c = 1; c < 63; c++) {
      // Sobel X: [-1 0 1; -2 0 2; -1 0 1]
      const gx =
        -gray[r - 1][c - 1] +
        gray[r - 1][c + 1] -
        2 * gray[r][c - 1] +
        2 * gray[r][c + 1] -
        gray[r + 1][c - 1] +
        gray[r + 1][c + 1];

      // Sobel Y: [-1 -2 -1; 0 0 0; 1 2 1]
      const gy =
        -gray[r - 1][c - 1] -
        2 * gray[r - 1][c] -
        gray[r - 1][c + 1] +
        gray[r + 1][c - 1] +
        2 * gray[r + 1][c] +
        gray[r + 1][c + 1];

      const mag = Math.sqrt(gx * gx + gy * gy);
      let angle = (Math.atan2(gy, gx) * 180) / Math.PI;
      if (angle < 0) angle += 360;
      const bin = Math.min(31, Math.floor((angle / 360) * 32));
      gradHist[bin] += mag;
    }
  }
  let normGrad = 0;
  for (let i = 0; i < 32; i++) normGrad += gradHist[i] * gradHist[i];
  normGrad = Math.sqrt(normGrad) + 1e-6;
  const normGradVec: number[] = [];
  for (let i = 0; i < 32; i++) normGradVec.push(gradHist[i] / normGrad);

  // Combine (32 + 64 + 32 = 128 dimensions) with weights matching python indexer
  const combined: number[] = [];
  for (let i = 0; i < 32; i++) combined.push(normHistVec[i] * 0.3);
  for (let i = 0; i < 64; i++) combined.push(normGridVec[i] * 0.4);
  for (let i = 0; i < 32; i++) combined.push(normGradVec[i] * 0.3);

  let finalNorm = 0;
  for (let i = 0; i < combined.length; i++) finalNorm += combined[i] * combined[i];
  finalNorm = Math.sqrt(finalNorm) + 1e-6;

  return combined.map((v) => Number((v / finalNorm).toFixed(5)));
}

/**
 * Compare target face descriptor against all photos in gallery.
 */
export function matchFaceAgainstGallery(
  targetDescriptor: number[],
  photos: GalleryPhotoItem[],
  minThreshold = 0.70
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const photo of photos) {
    let bestScore = 0;
    let bestBox: [number, number, number, number] | undefined;

    if (photo.faces && photo.faces.length > 0) {
      for (const face of photo.faces) {
        if (!face.descriptor || face.descriptor.length === 0) continue;
        const sim = cosineSimilarity(targetDescriptor, face.descriptor);
        if (sim > bestScore) {
          bestScore = sim;
          bestBox = face.box;
        }
      }
    }

    if (bestScore >= minThreshold) {
      // Map similarity (e.g. 0.70 - 1.0) to human percentage 70% - 99%
      const matchPercentage = Math.min(
        99,
        Math.max(60, Math.round(((bestScore - 0.6) / 0.4) * 40 + 60))
      );

      results.push({
        photo,
        score: bestScore,
        matchPercentage,
        bestBox,
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);
  return results;
}
