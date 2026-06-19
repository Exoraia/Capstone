import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs' // <-- BARU: Mengimpor modul File System bawaan Node.js
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    console.log('Mencoba membuka:', details.url);
    if (
      details.url === 'about:blank' ||
      details.url.includes('google.com') ||
      details.url.includes('firebaseapp.com') ||
      details.url.includes('googleapis.com')
    ) {
      return { action: 'allow' };
    }
    
    import('electron').then(({ shell }) => {
      shell.openExternal(details.url);
    });
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Your Auth Listener (with safety clear to prevent double-tabs on reload)
  ipcMain.removeAllListeners('open-auth-link')
  ipcMain.on('open-auth-link', (event, url) => {
    shell.openExternal(url)
  })

  // ========================================================================
  // BARU: IPC Handler untuk Membaca File Txt dari Documents
  // ========================================================================
  ipcMain.handle('read-txt-file', async (event, fileName) => {
    try {
      const dirPath = join(app.getPath('documents'), 'WorkNet_Files');
      const filePath = join(dirPath, fileName);
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content };
      }
      // Jika file fisik belum ada di disk, kembalikan string kosong
      return { success: true, content: '' }; 
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // ========================================================================
  // BARU: IPC Handler untuk Menyimpan/Menulis File Txt ke Documents
  // ========================================================================
  ipcMain.handle('save-txt-file', async (event, { fileName, content }) => {
    try {
      const dirPath = join(app.getPath('documents'), 'WorkNet_Files');
      
      // Buat folder WorkNet_Files otomatis jika belum tersedia
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      const filePath = join(dirPath, fileName);
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true, filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
  // ========================================================================
  
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})