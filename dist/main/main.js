"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const pdf_processor_1 = require("../shared/pdf-processor");
const excel_exporter_1 = require("../shared/excel-exporter");
let mainWindow = null;
const pdfProcessor = new pdf_processor_1.PDFProcessor();
const excelExporter = new excel_exporter_1.ExcelExporter();
function createWindow() {
    // Create the browser window
    mainWindow = new electron_1.BrowserWindow({
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
const template = [
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
                    electron_1.app.quit();
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
                    electron_1.dialog.showMessageBox(mainWindow, {
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
function openPDFDialog() {
    electron_1.dialog.showOpenDialog(mainWindow, {
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
async function processPDFFile(filePath) {
    try {
        console.log('Starting PDF processing for:', filePath);
        mainWindow?.webContents.send('pdf-processing-started');
        console.log('Calling pdfProcessor.processPDF...');
        const result = await pdfProcessor.processPDF(filePath);
        console.log('PDF processing completed:', result);
        mainWindow?.webContents.send('pdf-processing-complete', result);
        console.log('Sent pdf-processing-complete event to renderer');
    }
    catch (error) {
        console.error('Error processing PDF:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        mainWindow?.webContents.send('pdf-processing-error', errorMessage);
        console.log('Sent pdf-processing-error event to renderer');
    }
}
// IPC handlers
electron_1.ipcMain.handle('open-pdf-dialog', async () => {
    console.log('Main: open-pdf-dialog IPC handler called');
    // Call the exact same function that the menu uses
    openPDFDialog();
});
electron_1.ipcMain.handle('export-excel', async (event, data) => {
    try {
        const result = await electron_1.dialog.showSaveDialog(mainWindow, {
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
    }
    catch (error) {
        console.error('Error exporting to Excel:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return { success: false, message: errorMessage };
    }
});
// App event handlers
electron_1.app.whenReady().then(() => {
    createWindow();
    // Set application menu
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map