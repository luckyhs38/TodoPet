import { BrowserWindow } from 'electron';
import path from 'node:path';

const WINDOW_SIZE = 160;

export function createPetWindow(): BrowserWindow {
  const petWindow = new BrowserWindow({
    width: WINDOW_SIZE,
    height: WINDOW_SIZE,
    center: true,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void petWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void petWindow.loadFile(
      path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`,
      ),
    );
  }

  return petWindow;
}
