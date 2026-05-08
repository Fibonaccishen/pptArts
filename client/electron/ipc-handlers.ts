import { ipcMain, dialog } from 'electron';
import fs from 'fs';

export function registerIpcHandlers() {
  ipcMain.handle('save-file', async (_, buffer: ArrayBuffer, suggestedName: string) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '保存 PPTX 文件',
      defaultPath: suggestedName,
      filters: [{ name: 'PowerPoint', extensions: ['pptx'] }],
    });
    if (canceled || !filePath) return null;
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
  });
}
