export {};

declare global {
  interface Window {
    electronAPI?: {
      saveFile: (buffer: ArrayBuffer, suggestedName: string) => Promise<string | null>;
    };
  }
}
