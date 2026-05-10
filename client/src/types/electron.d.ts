export {};

declare global {
  interface Window {
    electronAPI?: {
      saveFile: (buffer: ArrayBuffer, suggestedName: string) => Promise<string | null>;
      checkForUpdates: () => Promise<{ updateAvailable: boolean; version?: string }>;
      quitAndInstall: () => void;
      onUpdateStatus: (callback: (status: { status: string }) => void) => void;
    };
  }
}
