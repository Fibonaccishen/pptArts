"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  saveFile: (buffer, suggestedName) => electron.ipcRenderer.invoke("save-file", buffer, suggestedName)
});
