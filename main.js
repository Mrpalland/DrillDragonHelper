// ----------------------------
// Made By Evan Nave 2024
// Concept and designs by Floombo
// ---
// Main Drilly logic stored in renderer.js
// ----------------------------
const { app, Tray, Menu, BrowserWindow, ipcMain, screen, nativeImage } = require('electron')
const path = require('node:path')

let tray;
let mainWindow;
let defaultSize;
let defaultY;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  defaultSize = Math.floor(height / 6);
  const w = defaultSize;
  defaultY = height - defaultSize;

  mainWindow = new BrowserWindow({
    width: w,
    height: defaultSize,
    x: 5,
    y: defaultY,
    transparent: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.setAlwaysOnTop(true, 'screen');

  mainWindow.loadFile('index.html');

  mainWindow.on('resize', () => {
    //const [width, height] = mainWindow.getSize();
    //console.log(`Window resized to: ${width}x${height}`);
  });

  mainWindow.on('move', () => {
    //const [x, y] = mainWindow.getPosition();
    //console.log(`Window moved to: ${x}, ${y}`);
  });

  ipcMain.handle('get-displays', () => screen.getAllDisplays());
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  const icon = nativeImage.createFromPath("./assets/icon.png");
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Control Panel',
      type: 'normal',
      click: () => {
        console.log('Opening application...');
        // -- Not currently implemented. --
        // let win = new BrowserWindow({ width: 800, height: 600 });
        // win.loadURL('controlpanel.html');
      }
    },
    {
      label: 'Reset Helper Position',
      type: 'normal',
      click: () => {
        console.log('Window Reset');
        mainWindow.setPosition(5,defaultY);
        mainWindow.setBounds({width: defaultSize, height: defaultSize})
      }
    },
    { type: 'separator' },
    {
      label: 'Enable Dark Mode',
      type: 'checkbox',
      checked: false,
      click: (menuItem) => {
        mainWindow.webContents.send('toggle-dark-mode', menuItem.checked);
        console.log(menuItem.checked ? 'Dark mode enabled' : 'Dark mode disabled');
      }
    },
    {
      label: 'Quick Options',
      submenu: [
        {
          label: 'Mute',
          type: 'checkbox',
          click: (menuItem) => {
            console.log(menuItem.checked ? 'Mute Not Yet Implemented' : 'UnMute Not Yet Implemented');
          }
        },
        {
          label: 'Push Notifications',
          type: 'checkbox',
          click: (menuItem) => {
            console.log(menuItem.checked ? 'Push notifications enabled' : 'Push notifications disabled');
          }
        },
        {
          label: 'Launch on Startup',
          type: 'checkbox',
          click: (menuItem) => {
            console.log(menuItem.checked ? 'Launch on Startup enabled' : 'Launch on Startup disabled');
          }
        }
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
});

app.on('before-quit', () => {
  if (tray) tray.destroy();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});