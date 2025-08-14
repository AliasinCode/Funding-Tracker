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
exports.PDFProcessor = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const types_1 = require("./types");
class PDFProcessor {
    constructor() {
        this.maxFileSize = 100 * 1024 * 1024; // 100MB
        this.supportedDocumentTypes = ['ECCA', 'MIPA', 'LLCA'];
    }
    async processPDF(filePath, options = this.getDefaultOptions()) {
        console.log('PDFProcessor.processPDF called with:', filePath);
        const startTime = Date.now();
        try {
            // Validate file
            console.log('Validating file...');
            await this.validateFile(filePath);
            // Extract text from PDF
            console.log('Extracting text from PDF...');
            const textContent = await this.extractTextFromPDF(filePath);
            console.log('Text extracted, length:', textContent.length);
            // Detect document type
            console.log('Detecting document type...');
            const documentType = this.detectDocumentType(textContent);
            console.log('Document type detected:', documentType);
            // Extract table of contents
            console.log('Extracting table of contents...');
            const tocResult = await this.extractTableOfContents(textContent, options);
            console.log('TOC extracted, sections count:', tocResult.sections.length);
            // Extract content for selected sections if requested
            if (options.extractContent) {
                console.log('Extracting section content...');
                await this.extractSectionContent(tocResult.sections, textContent);
            }
            // Get metadata
            console.log('Extracting metadata...');
            const metadata = await this.extractMetadata(filePath);
            const processingTime = Date.now() - startTime;
            console.log('Total processing time:', processingTime, 'ms');
            const result = {
                fileName: path.basename(filePath),
                filePath,
                documentType,
                sections: tocResult.sections,
                totalPages: metadata.pageCount,
                processingTime,
                metadata
            };
            console.log('Returning result:', result);
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error in processPDF:', errorMessage);
            throw new Error(`Failed to process PDF: ${errorMessage}`);
        }
    }
    getDefaultOptions() {
        return {
            extractTOC: true,
            extractContent: true,
            includeMetadata: true
        };
    }
    async validateFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error('File does not exist');
        }
        const stats = fs.statSync(filePath);
        if (stats.size > this.maxFileSize) {
            throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize / (1024 * 1024)}MB`);
        }
        const ext = path.extname(filePath).toLowerCase();
        if (ext !== '.pdf') {
            throw new Error('File must be a PDF');
        }
    }
    async extractTextFromPDF(filePath) {
        // This is a placeholder implementation
        // In the actual implementation, we'll use pdf-parse or similar library
        try {
            // For now, return a mock text content
            // TODO: Implement actual PDF text extraction
            return this.getMockTextContent();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to extract text from PDF: ${errorMessage}`);
        }
    }
    detectDocumentType(textContent) {
        const upperText = textContent.toUpperCase();
        if (upperText.includes('EQUITY CAPITAL CONTRIBUTION AGREEMENT') || upperText.includes('ECCA')) {
            return types_1.DocumentType.ECCA;
        }
        else if (upperText.includes('MASTER INTEREST PURCHASE AGREEMENT') || upperText.includes('MIPA')) {
            return types_1.DocumentType.MIPA;
        }
        else if (upperText.includes('LIMITED LIABILITY COMPANY AGREEMENT') || upperText.includes('LLCA')) {
            return types_1.DocumentType.LLCA;
        }
        return types_1.DocumentType.UNKNOWN;
    }
    async extractTableOfContents(textContent, options) {
        try {
            // This is a placeholder implementation
            // In the actual implementation, we'll use NLP techniques to detect TOC
            const sections = this.detectTOCSections(textContent);
            return {
                sections,
                confidence: 0.85,
                detectionMethod: 'pattern-matching'
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to extract table of contents: ${errorMessage}`);
        }
    }
    detectTOCSections(textContent) {
        // This is a placeholder implementation
        // In the actual implementation, we'll use more sophisticated TOC detection
        const lines = textContent.split('\n');
        const sections = [];
        let sectionId = 1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Simple pattern matching for section headers
            if (this.isSectionHeader(line)) {
                const level = this.getSectionLevel(line);
                const pageNumber = this.extractPageNumber(lines, i);
                sections.push({
                    id: `section-${sectionId++}`,
                    title: line,
                    level,
                    pageNumber,
                    content: '',
                    subsections: [],
                    selected: false
                });
            }
        }
        return this.buildSectionHierarchy(sections);
    }
    isSectionHeader(line) {
        // Simple heuristics for section headers
        const patterns = [
            /^[IVX]+\./, // Roman numerals
            /^\d+\./, // Decimal numbers
            /^[A-Z]\./, // Single letters
            /^[A-Z][a-z]+/, // Title case words
            /^ARTICLE\s+\d+/i, // Article numbers
            /^SECTION\s+\d+/i // Section numbers
        ];
        return patterns.some(pattern => pattern.test(line));
    }
    getSectionLevel(line) {
        if (/^[IVX]+\./.test(line))
            return 1;
        if (/^\d+\./.test(line))
            return 2;
        if (/^[A-Z]\./.test(line))
            return 3;
        if (/^[a-z]\./.test(line))
            return 4;
        return 1;
    }
    extractPageNumber(lines, currentIndex) {
        // Look for page numbers in nearby lines
        for (let i = Math.max(0, currentIndex - 2); i <= Math.min(lines.length - 1, currentIndex + 2); i++) {
            const pageMatch = lines[i].match(/(\d+)/);
            if (pageMatch) {
                const num = parseInt(pageMatch[1]);
                if (num > 0 && num < 10000) { // Reasonable page number range
                    return num;
                }
            }
        }
        return 1; // Default page number
    }
    buildSectionHierarchy(sections) {
        const rootSections = [];
        const sectionStack = [];
        for (const section of sections) {
            while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= section.level) {
                sectionStack.pop();
            }
            if (sectionStack.length === 0) {
                rootSections.push(section);
            }
            else {
                sectionStack[sectionStack.length - 1].subsections.push(section);
            }
            sectionStack.push(section);
        }
        return rootSections;
    }
    async extractSectionContent(sections, textContent) {
        // This is a placeholder implementation
        // In the actual implementation, we'll extract actual content for each section
        for (const section of sections) {
            section.content = this.extractContentForSection(section, textContent);
            await this.extractSectionContent(section.subsections, textContent);
        }
    }
    extractContentForSection(section, textContent) {
        // This is a placeholder implementation
        // In the actual implementation, we'll extract actual content between section boundaries
        // For now, return a placeholder content
        return `Content for section: ${section.title}`;
    }
    async extractMetadata(filePath) {
        try {
            const stats = fs.statSync(filePath);
            // This is a placeholder implementation
            // In the actual implementation, we'll extract actual PDF metadata
            return {
                pageCount: 1, // Placeholder
                fileSize: stats.size,
                title: path.basename(filePath, '.pdf'),
                creator: 'PDF Processor',
                producer: 'Unknown',
                creationDate: stats.birthtime,
                modificationDate: stats.mtime
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to extract metadata: ${errorMessage}`);
        }
    }
    getMockTextContent() {
        // Mock content for testing purposes
        return `
      EQUITY CAPITAL CONTRIBUTION AGREEMENT
      
      TABLE OF CONTENTS
      
      I. DEFINITIONS 1
      II. CONTRIBUTIONS 5
         A. Initial Contribution 5
         B. Additional Contributions 8
      III. REPRESENTATIONS AND WARRANTIES 12
         A. Company Representations 12
         B. Member Representations 15
      IV. GOVERNANCE 20
         A. Board of Directors 20
         B. Voting Rights 25
      V. DISTRIBUTIONS 30
      VI. TRANSFER RESTRICTIONS 35
      VII. MISCELLANEOUS 40
      
      ARTICLE I
      DEFINITIONS
      
      1.1 "Agreement" means this Equity Capital Contribution Agreement...
      
      1.2 "Board" means the Board of Directors of the Company...
      
      ARTICLE II
      CONTRIBUTIONS
      
      2.1 Initial Contribution. Each Member shall contribute...
      
      2.2 Additional Contributions. The Company may require...
    `;
    }
}
exports.PDFProcessor = PDFProcessor;
//# sourceMappingURL=pdf-processor.js.map