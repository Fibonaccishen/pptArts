import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';

function runLibreOffice(pptxPath: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const absPptxPath = path.resolve(pptxPath);
    const absOutputDir = path.resolve(outputDir);

    execFile(
      config.libreofficePath,
      ['--headless', '--convert-to', 'png', '--outdir', absOutputDir, absPptxPath],
      { timeout: 30000 },
      (err) => {
        if (err) {
          reject(new Error(`缩略图生成失败: ${err.message}`));
          return;
        }

        const pptxBaseName = path.basename(pptxPath, '.pptx');
        const generatedFile = path.join(absOutputDir, `${pptxBaseName}.png`);
        const newName = `${uuid()}.png`;
        const newPath = path.join(absOutputDir, newName);

        if (fs.existsSync(generatedFile)) {
          fs.renameSync(generatedFile, newPath);
        } else {
          reject(new Error('LibreOffice 未生成缩略图文件'));
          return;
        }

        resolve(newName);
      },
    );
  });
}

let queue: Promise<any> = Promise.resolve();

export function generateThumbnail(pptxPath: string): Promise<string> {
  queue = queue.then(() => runLibreOffice(pptxPath, config.thumbnailDir));
  return queue;
}
