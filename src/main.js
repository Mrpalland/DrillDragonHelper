// ----------------------------
// Evan Nave 2024
// Concept and designs by Floombo
// ---
// Main Drilly logic stored in renderer.js and helper.js
// ----------------------------
const { app, Tray, Menu, BrowserWindow, ipcMain, screen, nativeImage } = require('electron');
const path = require('node:path');
const fs = require('fs');

let tray;
let mainWindow;
let defaultSize;
let defaultY;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { height } = primaryDisplay.workAreaSize;

  defaultSize = Math.floor(height / 6);
  const w = defaultSize;
  defaultY = height - defaultSize;

  mainWindow = new BrowserWindow({
    width: w,
    height: defaultSize,
    x: 0,
    y: defaultY,
    transparent: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'screen');
  mainWindow.setResizable(false);
  mainWindow.loadFile('src/index.html');

  mainWindow.on('resize', () => {
    // TBD
  });

  mainWindow.on('move', () => {
    // TBD
  });

  ipcMain.handle('get-displays', () => screen.getAllDisplays());
}

function initializeTray() {
  const dir = folderExists('.', 'resources') ? path.join(process.resourcesPath, 'assets/icons/icon.png') : './assets/icons/icon.png';
  const icon = nativeImage.createFromPath(dir);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Reset Window Position',
      type: 'normal',
      click: resetWindowPosition
    },
    { type: 'separator' },
    {
      label: 'Mute',
      type: 'checkbox',
      click: (menuItem) => mainWindow.webContents.send('mute', menuItem.checked)
    },
    {
      label: 'Window Size',
      submenu: [
        { label: 'Tiny', type: 'radio', click: () => setHelperSize(0.08) },
        { label: 'Small', type: 'radio', checked: true, click: () => setHelperSize(0.167) },
        { label: 'Medium', type: 'radio', click: () => setHelperSize(0.25) },
        { label: 'Large', type: 'radio', click: () => setHelperSize(0.45) }
      ]
    },
    {
      label: 'Exit',
      type: 'normal',
      click: () => app.quit()
    }
  ]);

  tray.setToolTip('Drill Dragon Helper');
  tray.setContextMenu(contextMenu);
}

function resetWindowPosition() {
  mainWindow.setPosition(0, defaultY);
  mainWindow.setBounds({ width: defaultSize, height: defaultSize });
}

function setHelperSize(size) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { height } = primaryDisplay.workAreaSize;
  const dim = Math.floor(height * size);
  mainWindow.setPosition(0, height - dim);
  mainWindow.setResizable(true);
  mainWindow.setSize(dim, dim);
  mainWindow.setResizable(false);
}

function folderExists(dir, folderName) {
  try {
    const items = fs.readdirSync(dir);
    return items.some(item => fs.statSync(path.join(dir, item)).isDirectory() && item === folderName);
  } catch (err) {
    console.error('Error reading directory:', err);
    return false;
  }
}

app.whenReady().then(() => {
  createWindow();
  initializeTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (tray) tray.destroy();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});