import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (buffer: ArrayBuffer, suggestedName: string): Promise<string | null> =>
    ipcRenderer.invoke('save-file', buffer, suggestedName),
  checkForUpdates: (): Promise<{ updateAvailable: boolean; version?: string }> =>
    ipcRenderer.invoke('check-for-updates'),
  quitAndInstall: (): void => {
    ipcRenderer.invoke('quit-and-install');
  },
  onUpdateStatus: (callback: (status: { status: string }) => void) => {
    ipcRenderer.on('update-status', (_event, status) => callback(status));
  },
});
