import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';

async function trimWhitespace(inputPath: string, outputPath: string): Promise<void> {
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let top = 0, bottom = height - 1, left = 0, right = width - 1;

  const isWhite = (r: number, g: number, b: number, a: number) =>
    a === 0 || (r > 250 && g > 250 && b > 250);

  topLoop: for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      if (!isWhite(data[idx], data[idx + 1], data[idx + 2], channels === 4 ? data[idx + 3] : 255)) {
        top = y;
        break topLoop;
      }
    }
  }

  bottomLoop: for (let y = height - 1; y >= top; y--) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      if (!isWhite(data[idx], data[idx + 1], data[idx + 2], channels === 4 ? data[idx + 3] : 255)) {
        bottom = y;
        break bottomLoop;
      }
    }
  }

  leftLoop: for (let x = 0; x < width; x++) {
    for (let y = top; y <= bottom; y++) {
      const idx = (y * width + x) * channels;
      if (!isWhite(data[idx], data[idx + 1], data[idx + 2], channels === 4 ? data[idx + 3] : 255)) {
        left = x;
        break leftLoop;
      }
    }
  }

  rightLoop: for (let x = width - 1; x >= left; x--) {
    for (let y = top; y <= bottom; y++) {
      const idx = (y * width + x) * channels;
      if (!isWhite(data[idx], data[idx + 1], data[idx + 2], channels === 4 ? data[idx + 3] : 255)) {
        right = x;
        break rightLoop;
      }
    }
  }

  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;

  if (cropWidth <= 0 || cropHeight <= 0) return;

  // Add 5% padding, clamped to image bounds
  const padX = Math.round(cropWidth * 0.05);
  const padY = Math.round(cropHeight * 0.05);
  const extractLeft = Math.max(0, left - padX);
  const extractTop = Math.max(0, top - padY);
  const extractWidth = Math.min(cropWidth + padX * 2, width - extractLeft);
  const extractHeight = Math.min(cropHeight + padY * 2, height - extractTop);

  if (extractWidth <= 0 || extractHeight <= 0) return;

  let pipeline = sharp(inputPath).extract({
    left: extractLeft,
    top: extractTop,
    width: extractWidth,
    height: extractHeight,
  });

  // If the cropped area is very small, upscale to a visible minimum
  const MIN_WIDTH = 240;
  const MIN_HEIGHT = 180;
  if (extractWidth < MIN_WIDTH || extractHeight < MIN_HEIGHT) {
    pipeline = pipeline.resize(MIN_WIDTH, MIN_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: false,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    });
  }

  await pipeline.toFile(outputPath);
}

function runLibreOffice(pptxPath: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const absPptxPath = path.resolve(pptxPath);
    const absOutputDir = path.resolve(outputDir);

    const cmd = config.libreofficePath;
    const args = ['--headless', '--convert-to', 'png', '--outdir', absOutputDir, absPptxPath];

    console.log(`[Thumbnail] 执行: ${cmd} ${args.join(' ')}`);

    execFile(cmd, args, { timeout: 30000 }, async (err) => {
      if (err) {
        console.error(`[Thumbnail] 失败: ${err.message}`);
        reject(new Error(`缩略图生成失败: ${err.message}`));
        return;
      }

      const pptxBaseName = path.basename(pptxPath, '.pptx');
      const generatedFile = path.join(absOutputDir, `${pptxBaseName}.png`);

      console.log(`[Thumbnail] 查找生成文件: ${generatedFile}`);

      if (!fs.existsSync(generatedFile)) {
        console.error(`[Thumbnail] 文件未生成: ${generatedFile}`);
        reject(new Error('LibreOffice 未生成缩略图文件'));
        return;
      }

      try {
        const newName = `${uuid()}.png`;
        const newPath = path.join(absOutputDir, newName);
        await trimWhitespace(generatedFile, newPath);
        fs.unlinkSync(generatedFile); // delete original
        console.log(`[Thumbnail] 裁剪完成: ${newName}`);
        resolve(newName);
      } catch (trimErr: any) {
        // If trim fails, fall back to the original
        console.warn(`[Thumbnail] 裁剪失败，使用原图: ${trimErr.message}`);
        const newName = `${uuid()}.png`;
        const newPath = path.join(absOutputDir, newName);
        fs.renameSync(generatedFile, newPath);
        resolve(newName);
      }
    });
  });
}

let queue: Promise<any> = Promise.resolve();

export function generateThumbnail(pptxPath: string): Promise<string> {
  queue = queue.then(() => runLibreOffice(pptxPath, config.thumbnailDir));
  return queue;
}
