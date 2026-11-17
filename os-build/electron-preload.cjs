/**
 * LumeOS Secure Preload Bridge
 * Exposes window.lumeNative to the LumeOS WebOS UI.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumeNative', {
  isISO: process.env.LUMEOS_ISO === '1',
  platform: process.platform,
  arch: process.arch,
  reboot: () => ipcRenderer.send('lume:reboot'),
  shutdown: () => ipcRenderer.send('lume:shutdown'),
  toggleFullscreen: () => ipcRenderer.send('lume:toggle-fullscreen'),
  getSystemInfo: () => ipcRenderer.invoke('lume:system-info'),
});
