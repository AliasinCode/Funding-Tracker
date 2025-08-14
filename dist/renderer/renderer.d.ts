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
export {};
//# sourceMappingURL=renderer.d.ts.map