import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (buffer: ArrayBuffer, suggestedName: string, fileType?: string): Promise<string | null> =>
    ipcRenderer.invoke('save-file', buffer, suggestedName, fileType),
  checkForUpdates: (): Promise<{ updateAvailable: boolean; version?: string }> =>
    ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: (): void => {
    ipcRenderer.invoke('download-update');
  },
  quitAndInstall: (): void => {
    ipcRenderer.invoke('quit-and-install');
  },
  onUpdateStatus: (callback: (status: { status: string; version?: string }) => void) => {
    ipcRenderer.on('update-status', (_event, status) => callback(status));
  },
});
