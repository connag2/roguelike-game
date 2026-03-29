const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

process.on('uncaughtException', (error) => {
  dialog.showErrorBox('에러 발생!', error.stack || error.message || String(error));
  app.quit();
});

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, 'dist/index.html')}`;
  win.loadURL(startUrl);

  win.on('close', (e) => {
    win.webContents.send('save-request');
    const choice = dialog.showMessageBoxSync(win, {
      type: 'question',
      buttons: ['저장 후 종료', '취소', '그냥 종료'],
      title: '게임 종료',
      message: '변경사항을 저장하고 종료하시겠습니까?',
      defaultId: 0,
      cancelId: 1
    });

    if (choice === 1) {
      e.preventDefault(); 
    } else if (choice === 0) {
      setTimeout(() => { app.exit(); }, 500); 
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});