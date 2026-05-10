export {};

declare global {
  interface Window {
    electronAPI?: {
      saveFile: (buffer: ArrayBuffer, suggestedName: string, fileType?: string) => Promise<string | null>;
      checkForUpdates: () => Promise<{ updateAvailable: boolean; version?: string }>;
      downloadUpdate: () => void;
      quitAndInstall: () => void;
      onUpdateStatus: (callback: (status: { status: string; version?: string }) => void) => void;
    };
  }
}
