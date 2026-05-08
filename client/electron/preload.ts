import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (buffer: ArrayBuffer, suggestedName: string): Promise<string | null> =>
    ipcRenderer.invoke('save-file', buffer, suggestedName),
});
