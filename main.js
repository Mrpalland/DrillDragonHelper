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
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

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
    //skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.setAlwaysOnTop(true, 'screen');
  mainWindow.setResizable(false);

  mainWindow.loadFile('index.html');

  mainWindow.on('resize', () => {
    //const [width, height] = mainWindow.getSize();
    //console.log(`Window resized to: ${width}x${height}`);
  });

  mainWindow.on('move', () => {
    //mainWindow.webContents.send('window-moving', menuItem.checked);
  });

  ipcMain.handle('get-displays', () => screen.getAllDisplays());
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  var dir;
  if(!folderExists('.', 'resources')){
    dir = './assets/icons/icon.png';
  } else {
    dir = path.join(process.resourcesPath, 'assets/icons/icon.png');
  }
  const icon = nativeImage.createFromPath(dir);
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    /*{
      label: 'Open Control Panel',
      type: 'normal',
      click: () => {
        console.log('Opening application...');
        // -- Not currently implemented. --
        // let win = new BrowserWindow({ width: 800, height: 600 });
        // win.loadURL('controlpanel.html');
      }
    },*/
    {
      label: 'Reset Window Position',
      type: 'normal',
      click: () => {
        console.log('Window Reset');
        mainWindow.setPosition(0,defaultY);
        mainWindow.setBounds({width: defaultSize, height: defaultSize})
      }
    },
    { type: 'separator' },
    /*{
      label: 'Enable Dark Mode',
      type: 'checkbox',
      checked: false,
      click: (menuItem) => {
        mainWindow.webContents.send('toggle-dark-mode', menuItem.checked);
        console.log(menuItem.checked ? 'Dark mode enabled' : 'Dark mode disabled');
      }
    },*/
    {
      label: 'Mute',
      type: 'checkbox',
      click: (menuItem) => {
        mainWindow.webContents.send('mute', menuItem.checked);
      }
    },
    {
      label: 'Window Size',
      submenu: [ //Planned functionality will let user decide window size
        { 
          label: 'Tiny', 
          type: 'radio', 
          click: () => setHelperSize(0.08) 
        },
        { 
          label: 'Small', 
          type: 'radio', 
          checked: true,
          click: () => setHelperSize(0.167)
        },
        { 
          label: 'Medium', 
          type: 'radio', 
          click: () => setHelperSize(0.25) 
        },
        { 
          label: 'Large', 
          type: 'radio', 
          click: () => setHelperSize(0.45) 
        }
        /*,
        {
          label: 'Launch on Startup',
          type: 'checkbox',
          click: (menuItem) => {
            console.log(menuItem.checked ? 'Launch on Startup enabled' : 'Launch on Startup disabled');
          }
        }*/
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

function setHelperSize(size){
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  var dim = Math.floor(height * size);
  mainWindow.setPosition(0, height - dim);
  mainWindow.setResizable(true);
  mainWindow.setSize(dim, dim);
  mainWindow.setResizable(false);
}

function folderExists(dir, folderName) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory() && item === folderName) {
        return true;
      }
    }
    return false;
  } catch (err) {
    console.error('Error reading directory:', err);
    return false;
  }
}