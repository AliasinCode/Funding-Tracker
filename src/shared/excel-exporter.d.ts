import { ExcelExportData, DocumentSection, DocumentType } from './types';
export declare class ExcelExporter {
    exportToExcel(data: ExcelExportData, filePath: string): Promise<void>;
    private createMockExcelFile;
    private flattenSections;
    exportSelectedSections(sections: DocumentSection[], documentType: DocumentType, fileName: string, filePath: string): Promise<void>;
    private getSelectedSections;
    exportToMultipleSheets(sections: DocumentSection[], documentType: DocumentType, fileName: string, filePath: string): Promise<void>;
    private extractTOCData;
    private extractContentData;
}
//# sourceMappingURL=excel-exporter.d.ts.map