import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // PDF processing
  openPDFDialog: async () => {
    console.log('Preload: openPDFDialog called');
    try {
      const result = await ipcRenderer.invoke('open-pdf-dialog');
      console.log('Preload: openPDFDialog result:', result);
      return result;
    } catch (error) {
      console.error('Preload: openPDFDialog error:', error);
      throw error;
    }
  },
  exportToExcel: (data: any) => ipcRenderer.invoke('export-excel', data),
  
  // Event listeners
  onPDFProcessingStarted: (callback: () => void) => {
    ipcRenderer.on('pdf-processing-started', callback);
  },
  
  onPDFProcessingComplete: (callback: (data: any) => void) => {
    ipcRenderer.on('pdf-processing-complete', callback);
  },
  
  onPDFProcessingError: (callback: (error: string) => void) => {
    ipcRenderer.on('pdf-processing-error', (event, error) => callback(error));
  },
  
  onExportExcel: (callback: () => void) => {
    ipcRenderer.on('export-excel', (event) => callback());
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Type definitions for the exposed API
declare global {
  interface Window {
    electronAPI: {
      openPDFDialog: () => Promise<void>;
      exportToExcel: (data: any) => Promise<any>;
      onPDFProcessingStarted: (callback: () => void) => void;
      onPDFProcessingComplete: (callback: (data: any) => void) => void;
      onPDFProcessingError: (callback: (error: string) => void) => void;
      onExportExcel: (callback: () => void) => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}
