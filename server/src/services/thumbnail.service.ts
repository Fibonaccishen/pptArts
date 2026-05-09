import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';

function runLibreOffice(pptxPath: string, outputDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const absPptxPath = path.resolve(pptxPath);
    const absOutputDir = path.resolve(outputDir);

    const cmd = config.libreofficePath;
    const args = ['--headless', '--convert-to', 'png', '--outdir', absOutputDir, absPptxPath];

    console.log(`[Thumbnail] 执行: ${cmd} ${args.join(' ')}`);

    execFile(cmd, args, { timeout: 30000 }, (err) => {
      if (err) {
        console.error(`[Thumbnail] 失败: ${err.message}`);
        reject(new Error(`缩略图生成失败: ${err.message}`));
        return;
      }

      const pptxBaseName = path.basename(pptxPath, '.pptx');
      const generatedFile = path.join(absOutputDir, `${pptxBaseName}.png`);

      console.log(`[Thumbnail] 查找生成文件: ${generatedFile}`);

      if (fs.existsSync(generatedFile)) {
        const newName = `${uuid()}.png`;
        const newPath = path.join(absOutputDir, newName);
        fs.renameSync(generatedFile, newPath);
        console.log(`[Thumbnail] 成功: ${newName}`);
        resolve(newName);
      } else {
        console.error(`[Thumbnail] 文件未生成: ${generatedFile}`);
        reject(new Error('LibreOffice 未生成缩略图文件'));
      }
    });
  });
}

let queue: Promise<any> = Promise.resolve();

export function generateThumbnail(pptxPath: string): Promise<string> {
  queue = queue.then(() => runLibreOffice(pptxPath, config.thumbnailDir));
  return queue;
}
