import { ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import fs from 'fs';

export function registerIpcHandlers() {
  ipcMain.handle('save-file', async (_, buffer: ArrayBuffer, suggestedName: string, fileType?: string) => {
    const ft = fileType || 'pptx';
    const filters: Electron.FileFilter[] = [
      { name: 'PPTX', extensions: ['pptx'] },
      { name: 'PNG 图片', extensions: ['png'] },
      { name: 'SVG 矢量图', extensions: ['svg'] },
      { name: '所有文件', extensions: ['*'] },
    ];
    const idx = filters.findIndex((f) => f.name === (ft === 'pptx' ? 'PPTX' : ft === 'png' ? 'PNG 图片' : 'SVG 矢量图'));
    if (idx > 0) {
      const [match] = filters.splice(idx, 1);
      filters.unshift(match);
    }
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '保存文件',
      defaultPath: suggestedName,
      filters,
    });
    if (canceled || !filePath) return null;
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
  });

  ipcMain.handle('check-for-updates', async () => {
    const result = await autoUpdater.checkForUpdates();
    if (!result) return { updateAvailable: false };
    return { updateAvailable: true, version: result.updateInfo.version };
  });

  ipcMain.handle('download-update', () => {
    autoUpdater.downloadUpdate();
  });

  ipcMain.handle('quit-and-install', () => {
    autoUpdater.quitAndInstall();
  });
}
