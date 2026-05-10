import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';

// ---- types ----

interface ContentBounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface BoundsResult {
  slide_w: number;
  slide_h: number;
  slides: (ContentBounds | null)[];
}

// ---- constants ----

const TOOLS_DIR = path.resolve(__dirname, '../../../tools');
const PADDING_RATIO = 0.12;
const MIN_SIZE = 240;

// ---- step 1: detect content bounding box from PPTX XML ----

function getContentBounds(pptxPath: string): Promise<BoundsResult | null> {
  return new Promise((resolve) => {
    const script = path.join(TOOLS_DIR, 'ppt_bounds.py');
    execFile('python3', [script, pptxPath], { timeout: 10000 }, (err, stdout) => {
      if (err) {
        console.warn(`[Thumbnail] bounds detection skipped: ${err.message}`);
        resolve(null);
        return;
      }
      try {
        const result = JSON.parse(stdout) as BoundsResult;
        if (!result.slide_w || !result.slide_h) {
          resolve(null);
          return;
        }
        resolve(result);
      } catch {
        resolve(null);
      }
    });
  });
}

// ---- step 2: render PPTX to PNG via LibreOffice ----

function runLibreOffice(pptxPath: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const absPptxPath = path.resolve(pptxPath);
    const absOutputDir = path.resolve(outputDir);

    const cmd = config.libreofficePath;
    const args = ['--headless', '--convert-to', 'png', '--outdir', absOutputDir, absPptxPath];

    execFile(cmd, args, { timeout: 30000 }, (err) => {
      if (err) {
        reject(new Error(`LibreOffice 渲染失败: ${err.message}`));
        return;
      }

      const pptxBaseName = path.basename(pptxPath, '.pptx');
      const generatedFile = path.join(absOutputDir, `${pptxBaseName}.png`);

      if (!fs.existsSync(generatedFile)) {
        reject(new Error('LibreOffice 未生成缩略图'));
        return;
      }

      resolve(generatedFile);
    });
  });
}

// ---- step 3: crop to content and upscale ----

async function cropToContent(
  sourcePath: string,
  outputPath: string,
  bounds: ContentBounds,
  slideW: number,
  slideH: number,
): Promise<void> {
  const meta = await sharp(sourcePath).metadata();
  const imgW = meta.width!;
  const imgH = meta.height!;

  if (imgW === 0 || imgH === 0) return;

  // EMU → pixel coordinates
  const scaleX = imgW / slideW;
  const scaleY = imgH / slideH;

  let left = Math.round(bounds.x * scaleX);
  let top = Math.round(bounds.y * scaleY);
  let width = Math.round(bounds.w * scaleX);
  let height = Math.round(bounds.h * scaleY);

  // Add padding
  const padX = Math.round(width * PADDING_RATIO);
  const padY = Math.round(height * PADDING_RATIO);
  left = Math.max(0, left - padX);
  top = Math.max(0, top - padY);
  width = Math.min(imgW - left, width + padX * 2);
  height = Math.min(imgH - top, height + padY * 2);

  if (width <= 0 || height <= 0) return;

  let pipeline = sharp(sourcePath).extract({ left, top, width, height });

  if (width < MIN_SIZE || height < MIN_SIZE) {
    pipeline = pipeline.resize(MIN_SIZE, MIN_SIZE, {
      fit: 'inside',
      withoutEnlargement: false,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    });
  }

  await pipeline.toFile(outputPath);
}

// ---- step 3b: fallback — trim empty edges with sharp ----

async function trimAndResize(sourcePath: string, outputPath: string): Promise<void> {
  const trimmed = await sharp(sourcePath)
    .trim({ threshold: 15 })
    .toBuffer({ resolveWithObject: true });

  const { info } = trimmed;

  if (info.width < MIN_SIZE || info.height < MIN_SIZE) {
    await sharp(trimmed.data)
      .resize(MIN_SIZE, MIN_SIZE, {
        fit: 'inside',
        withoutEnlargement: false,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .toFile(outputPath);
  } else {
    await sharp(trimmed.data).toFile(outputPath);
  }
}

// ---- main pipeline ----

async function processOne(pptxPath: string): Promise<string> {
  const tmpDir = config.thumbnailDir;

  // 1. Try bounds detection
  const boundsResult = await getContentBounds(pptxPath);

  // 2. Render with LibreOffice
  const rawPng = await runLibreOffice(pptxPath, tmpDir);

  // 3. Crop
  const finalName = `${uuid()}.png`;
  const finalPath = path.join(tmpDir, finalName);

  if (boundsResult) {
    const slide1 = boundsResult.slides[0];
    if (slide1) {
      try {
        await cropToContent(rawPng, finalPath, slide1, boundsResult.slide_w, boundsResult.slide_h);
        fs.unlinkSync(rawPng);
        console.log(`[Thumbnail] XML-cropped: ${finalName}`);
        return finalName;
      } catch (err: any) {
        console.warn(`[Thumbnail] crop failed, falling back to trim: ${err.message}`);
      }
    }
  }

  // Fallback: trim-based processing
  try {
    await trimAndResize(rawPng, finalPath);
    fs.unlinkSync(rawPng);
    console.log(`[Thumbnail] trim-fallback: ${finalName}`);
  } catch {
    fs.renameSync(rawPng, finalPath);
    console.log(`[Thumbnail] raw (no processing): ${finalName}`);
  }

  return finalName;
}

// ---- export (serialized queue) ----

let queue: Promise<any> = Promise.resolve();

export function generateThumbnail(pptxPath: string): Promise<string> {
  queue = queue.then(() => processOne(pptxPath));
  return queue;
}
