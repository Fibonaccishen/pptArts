import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';

async function processThumbnail(inputPath: string, outputPath: string): Promise<void> {
  // Let sharp auto-trim empty edges, then upscale if too small
  const trimmed = await sharp(inputPath)
    .trim({ threshold: 15 })
    .toBuffer({ resolveWithObject: true });

  const { info } = trimmed;

  const MIN_SIZE = 240;
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
        await processThumbnail(generatedFile, newPath);
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
