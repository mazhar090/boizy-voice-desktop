const { contextBridge, ipcRenderer } = require('electron');

// Expose only a small, safe desktop bridge. The existing website continues to
// run as a normal web page with Node integration disabled.
contextBridge.exposeInMainWorld('voiceChatDesktop', Object.freeze({
  isDesktopApp: true,
  appName: 'VoiceChat',
  platform: process.platform
}));
