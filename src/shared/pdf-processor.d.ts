import { PDFProcessingResult, ProcessingOptions } from './types';
export declare class PDFProcessor {
    private readonly maxFileSize;
    private readonly supportedDocumentTypes;
    processPDF(filePath: string, options?: ProcessingOptions): Promise<PDFProcessingResult>;
    private getDefaultOptions;
    private validateFile;
    private extractTextFromPDF;
    private detectDocumentType;
    private extractTableOfContents;
    private detectTOCSections;
    private isSectionHeader;
    private getSectionLevel;
    private extractPageNumber;
    private buildSectionHierarchy;
    private extractSectionContent;
    private extractContentForSection;
    private extractMetadata;
    private getMockTextContent;
}
//# sourceMappingURL=pdf-processor.d.ts.map