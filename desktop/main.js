const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess = null;

function startBackend() {
  return new Promise((resolve) => {
    const backendDir = path.join(__dirname, '../backend');

    // First check if backend is already up
    const http = require('http');
    const check = http.get('http://localhost:3000/health', () => {
      console.log('[Backend] Already running on port 3000');
      resolve();
    });
    check.on('error', () => {
      // Not running — spawn it
      backendProcess = spawn('node', ['src/server.js'], {
        cwd: backendDir,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      backendProcess.stdout.on('data', (data) => {
        const msg = data.toString();
        console.log('[Backend]', msg.trim());
        if (msg.includes('GovWatch API running')) resolve();
      });

      backendProcess.stderr.on('data', (data) => {
        console.error('[Backend]', data.toString().trim());
      });

      backendProcess.on('error', () => resolve());
      setTimeout(resolve, 6000);
    });
  });
}

async function createWindow() {
  await startBackend();

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    backgroundColor: '#080B13',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) backendProcess.kill();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.on('open-external', (_, url) => {
  shell.openExternal(url);
});
