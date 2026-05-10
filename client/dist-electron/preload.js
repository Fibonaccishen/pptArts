"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (buffer, suggestedName) => electron.ipcRenderer.invoke("save-file", buffer, suggestedName),
  checkForUpdates: () => electron.ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => {
    electron.ipcRenderer.invoke("download-update");
  },
  quitAndInstall: () => {
    electron.ipcRenderer.invoke("quit-and-install");
  },
  onUpdateStatus: (callback) => {
    electron.ipcRenderer.on("update-status", (_event, status) => callback(status));
  }
});
