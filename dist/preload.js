"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    // PDF processing
    openPDFDialog: () => electron_1.ipcRenderer.invoke('open-pdf-dialog'),
    exportToExcel: (data) => electron_1.ipcRenderer.invoke('export-excel', data),
    // Event listeners
    onPDFProcessingStarted: (callback) => {
        electron_1.ipcRenderer.on('pdf-processing-started', callback);
    },
    onPDFProcessingComplete: (callback) => {
        electron_1.ipcRenderer.on('pdf-processing-complete', callback);
    },
    onPDFProcessingError: (callback) => {
        electron_1.ipcRenderer.on('pdf-processing-error', callback);
    },
    onExportExcel: (callback) => {
        electron_1.ipcRenderer.on('export-excel', callback);
    },
    // Remove listeners
    removeAllListeners: (channel) => {
        electron_1.ipcRenderer.removeAllListeners(channel);
    }
});
//# sourceMappingURL=preload.js.map