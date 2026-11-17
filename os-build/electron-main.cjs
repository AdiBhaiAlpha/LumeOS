/**
 * LumeOS Bare-Metal / Kiosk Electron Shell
 * Loads the statically built Vite bundle (../dist/index.html) outside the browser.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

// Enable WebGL & hardware/software rendering fallback for bare-metal & VMs (QEMU/VirtualBox)
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-unsafe-swiftshader');
app.commandLine.appendSwitch('no-sandbox');

const isISO = process.env.LUMEOS_ISO === '1';

function createDesktopWindow() {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true,
    kiosk: isISO,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: '#07090e',
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Load offline built LumeOS dist/index.html
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  win.on('closed', () => {
    app.quit();
  });
}

ipcMain.on('lume:reboot', () => {
  if (isISO) {
    exec('systemctl reboot || reboot');
  } else {
    BrowserWindow.getAllWindows().forEach((w) => w.reload());
  }
});

ipcMain.on('lume:shutdown', () => {
  if (isISO) {
    exec('systemctl poweroff || poweroff');
  } else {
    app.quit();
  }
});

ipcMain.on('lume:toggle-fullscreen', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.setFullScreen(!win.isFullScreen());
});

ipcMain.handle('lume:system-info', () => ({
  isNativeISO: isISO,
  platform: os.platform(),
  arch: os.arch(),
  hostname: os.hostname(),
  uptimeSeconds: Math.floor(os.uptime()),
}));

app.whenReady().then(createDesktopWindow);

app.on('window-all-closed', () => {
  app.quit();
});
