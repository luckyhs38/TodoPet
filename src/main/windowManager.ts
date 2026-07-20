import { BrowserWindow, screen } from 'electron';
import path from 'node:path';

const WINDOW_SIZE = 160;
const RIGHT_MARGIN = 16;
const BOTTOM_MARGIN = 0;

export function createPetWindow(): BrowserWindow {
  // Read the usable bounds first, then offset the window from the bottom-right.
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + workArea.width - WINDOW_SIZE - RIGHT_MARGIN;
  const y = workArea.y + workArea.height - WINDOW_SIZE - BOTTOM_MARGIN;

  const petWindow = new BrowserWindow({
    width: WINDOW_SIZE,
    height: WINDOW_SIZE,
    x,
    y,
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
