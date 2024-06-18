// Modules to control application life and create native browser window
const { app, Tray, Menu, BrowserWindow, ipcMain, screen, nativeImage } = require('electron')
const path = require('node:path')

let tray;

function createWindow () {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  var h = 500;
  var w = 500;

  const startYPos = height - h;
  const mainWindow = new BrowserWindow({
    width: w,
    height: h,
    x:5,
    y:startYPos,
    transparent: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true, // enable node integration
      contextIsolation: false // disable context isolation
    }
  })
  mainWindow.setAlwaysOnTop(true, 'screen')
  //mainWindow.setResizable(false);

  mainWindow.loadFile('index.html')

  mainWindow.on('resize', function () {
    var size   = mainWindow.getSize();
    var width  = size[0];
    var height = size[1];
    console.log("width: " + width);
    console.log("height: " + height);
  });

  mainWindow.on('move', () => {
    console.log('The window has been moved.');
    const [x, y] = mainWindow.getPosition();
    //console.log(`New position: ${x}, ${y}`);
  });

  ipcMain.handle('get-displays', () => {
    return screen.getAllDisplays()
  })}
  

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  const icon = nativeImage.createFromPath("./assets/icon.png");
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ]);

  tray.setToolTip('Drill Dragon Helper');
  tray.setContextMenu(contextMenu);
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})