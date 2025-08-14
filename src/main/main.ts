import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { PDFProcessor } from '../shared/pdf-processor';
import { ExcelExporter } from '../shared/excel-exporter';

let mainWindow: BrowserWindow | null = null;
const pdfProcessor = new PDFProcessor();
const excelExporter = new ExcelExporter();

function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Renewable Energy Document Parser'
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));

  // Open DevTools in development
  mainWindow.webContents.openDevTools();

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create menu template
const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open PDF',
        accelerator: 'CmdOrCtrl+O',
        click: () => {
          openPDFDialog();
        }
      },
      {
        label: 'Export to Excel',
        accelerator: 'CmdOrCtrl+E',
        click: () => {
          mainWindow?.webContents.send('export-excel');
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          dialog.showMessageBox(mainWindow!, {
            type: 'info',
            title: 'About',
            message: 'Renewable Energy Document Parser',
            detail: 'Version 1.0.0\nA desktop application for parsing renewable energy legal documents and extracting table of contents.'
          });
        }
      }
    ]
  }
];

function openPDFDialog(): void {
  dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'PDF Files', extensions: ['pdf'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      processPDFFile(filePath);
    }
  }).catch(err => {
    console.error('Error opening file dialog:', err);
  });
}

async function processPDFFile(filePath: string): Promise<void> {
  try {
    console.log('Starting PDF processing for:', filePath);
    mainWindow?.webContents.send('pdf-processing-started');
    
    console.log('Calling pdfProcessor.processPDF...');
    const result = await pdfProcessor.processPDF(filePath);
    console.log('PDF processing completed:', result);
    
    mainWindow?.webContents.send('pdf-processing-complete', result);
    console.log('Sent pdf-processing-complete event to renderer');
  } catch (error) {
    console.error('Error processing PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    mainWindow?.webContents.send('pdf-processing-error', errorMessage);
    console.log('Sent pdf-processing-error event to renderer');
  }
}

// IPC handlers
ipcMain.handle('open-pdf-dialog', async () => {
  console.log('Main: open-pdf-dialog IPC handler called');
  // Call the exact same function that the menu uses
  openPDFDialog();
});

ipcMain.handle('export-excel', async (event, data) => {
  try {
    const result = await dialog.showSaveDialog(mainWindow!, {
      defaultPath: 'document_sections.xlsx',
      filters: [
        { name: 'Excel Files', extensions: ['xlsx'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      await excelExporter.exportToExcel(data, result.filePath);
      return { success: true, filePath: result.filePath };
    }
    return { success: false, message: 'Export cancelled' };
      } catch (error) {
      console.error('Error exporting to Excel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: errorMessage };
    }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  // Set application menu
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
