const { app, BrowserWindow, Tray, Menu, nativeImage, Notification, globalShortcut, shell, dialog } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

const APP_URL = 'https://mazharvoice.kesug.com/';
let win = null;
let tray = null;
let quitting = false;
let isMuted = false;

app.setAppUserModelId('com.voicechat.desktop');

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    show: false,
    backgroundColor: '#090d18',
    title: 'VoiceChat',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    }
  });

  win.once('ready-to-show', () => win.show());
  win.loadURL(APP_URL);

  // Keep external links in the user's default browser rather than navigating
  // the app away from the VoiceChat service.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://') && !url.startsWith(APP_URL)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // WebRTC permissions required by the existing website's microphone/call UI.
  win.webContents.session.setPermissionRequestHandler((wc, permission, callback) => {
    const allowed = ['media', 'notifications', 'fullscreen', 'clipboard-read', 'clipboard-sanitized-write'];
    callback(allowed.includes(permission));
  });

  win.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && input.key === 'F5') win.webContents.reload();
  });

  // Route website Notification API messages to native Windows notifications.
  win.on('close', (event) => {
    if (!quitting) {
      event.preventDefault();
      win.hide();
    }
  });
  win.on('closed', () => { win = null; });
}

function toggleWebsiteMute() {
  if (!win || win.isDestroyed()) return;
  win.show();
  win.webContents.executeJavaScript(`
    (() => {
      const button = document.querySelector('#mb');
      if (button) { button.click(); return true; }
      return false;
    })()
  `).then(ok => {
    if (!ok && win) {
      new Notification({ title: 'VoiceChat', body: 'Open a voice call before using the mute shortcut.' }).show();
    }
  }).catch(() => {});
}

function createTray() {
  // A simple generated tray icon is used if no branded ICO is supplied.
  const iconPath = path.join(__dirname, 'assets', 'tray.png');
  let image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) image = nativeImage.createEmpty();
  tray = new Tray(image);
  tray.setToolTip('VoiceChat');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open VoiceChat', click: () => { if (win) { win.show(); win.focus(); } } },
    { label: 'Mute / Unmute  (Ctrl+Shift+M)', click: toggleWebsiteMute },
    { type: 'separator' },
    { label: 'Check for Updates', click: () => checkForUpdates(true) },
    { type: 'separator' },
    { label: 'Exit', click: () => { quitting = true; app.quit(); } }
  ]));
  tray.on('double-click', () => { if (win) { win.show(); win.focus(); } });
}

function checkForUpdates(manual = false) {
  if (!app.isPackaged) {
    if (manual && win) dialog.showMessageBox(win, { message: 'Automatic updates are available in packaged releases after a release feed is configured.' });
    return;
  }
  autoUpdater.checkForUpdates().catch(err => {
    if (manual && win) dialog.showMessageBox(win, { type: 'warning', message: 'Could not check for updates.', detail: String(err.message || err) });
  });
}

app.whenReady().then(() => {
  app.setLoginItemSettings({ openAtLogin: true, path: process.execPath });
  createWindow();
  createTray();

  const muteShortcutRegistered = globalShortcut.register('CommandOrControl+Shift+M', toggleWebsiteMute);
  if (!muteShortcutRegistered) {
    console.warn('VoiceChat: Ctrl+Shift+M could not be registered; another app may be using it.');
  }

  autoUpdater.autoDownload = false;
  autoUpdater.on('update-available', info => {
    if (new Notification({ title: 'VoiceChat Update', body: `Version ${info.version} is available. Open the app menu to install it.` })) {
      // Notification display is best-effort; update download remains user-confirmed.
    }
  });
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({ type: 'info', message: 'VoiceChat update downloaded. The app will restart to install it.', buttons: ['Install now', 'Later'] })
      .then(({ response }) => { if (response === 0) autoUpdater.quitAndInstall(); });
  });
  checkForUpdates(false);

  app.on('activate', () => { if (win) { win.show(); win.focus(); } else createWindow(); });
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {
  // Keep running in the Windows notification area until Exit is selected.
});
