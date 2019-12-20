// Modules to control application life and create native browser window
const { app, BrowserWindow, shell, Menu } = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 750,
    height: 650,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      devTools: false
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('./build/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.

  let menu = [
    {
      label: '窗口',
      role: 'window',
      submenu: [
        {
          label: '最小化',
          accelerator: 'CmdOrCtrl+M',
          role: 'minimize'
        },
        {
          label: '关闭',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        }
      ]
    },
    {
      label: '帮助',
      role: 'help',
      submenu: [
        {
          label: '更多',
          click: () => {
            shell.openExternal('https://github.com/AbrahamNtlt/zerldamapclient')
          }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    const name = app.getName()
    menu.unshift({
      label: name,
      submenu: [
        {
          label: `关于 ${name}`,
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          label: '设置',
          accelerator: 'Command+,',
          click: () => {
            ipcMain.emit('open-settings-window')
          }
        },
        {
          type: 'separator'
        },
        {
          label: `隐藏 ${name}`,
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: '隐藏其它',
          accelerator: 'Command+Alt+H',
          role: 'hideothers'
        },
        {
          label: '显示全部',
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          accelerator: 'Command+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    })
  } else {
    menu[0].submenu.push({
      label: '设置',
      accelerator: 'Ctrl+,',
      click: () => {
        ipcMain.emit('open-settings-window')
      }
    })
  }

  mainWindow.removeMenu()
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))

  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
