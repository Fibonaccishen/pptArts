"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
function registerIpcHandlers() {
  electron.ipcMain.handle("save-file", async (_, buffer, suggestedName) => {
    const { canceled, filePath } = await electron.dialog.showSaveDialog({
      title: "保存 PPTX 文件",
      defaultPath: suggestedName,
      filters: [{ name: "PowerPoint", extensions: ["pptx"] }]
    });
    if (canceled || !filePath) return null;
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return filePath;
  });
}
let mainWindow = null;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: "PPTArts"
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
electron.app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
