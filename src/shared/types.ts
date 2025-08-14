export interface DocumentSection {
  id: string;
  title: string;
  level: number;
  pageNumber: number;
  content: string;
  subsections: DocumentSection[];
  selected: boolean;
}

export interface PDFProcessingResult {
  fileName: string;
  filePath: string;
  documentType: DocumentType;
  sections: DocumentSection[];
  totalPages: number;
  processingTime: number;
  metadata: PDFMetadata;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
  fileSize: number;
}

export enum DocumentType {
  ECCA = 'ECCA',
  MIPA = 'MIPA',
  LLCA = 'LLCA',
  UNKNOWN = 'UNKNOWN'
}

export interface ExcelExportData {
  fileName: string;
  documentType: DocumentType;
  sections: DocumentSection[];
  exportDate: Date;
}

export interface ProcessingOptions {
  extractTOC: boolean;
  extractContent: boolean;
  maxPages?: number;
  includeMetadata: boolean;
}

export interface TOCDetectionResult {
  sections: DocumentSection[];
  confidence: number;
  detectionMethod: string;
}

export interface ProcessingProgress {
  stage: ProcessingStage;
  progress: number;
  message: string;
  currentPage?: number;
  totalPages?: number;
}

export enum ProcessingStage {
  INITIALIZING = 'INITIALIZING',
  EXTRACTING_TEXT = 'EXTRACTING_TEXT',
  DETECTING_TOC = 'DETECTING_TOC',
  PARSING_SECTIONS = 'PARSING_SECTIONS',
  EXTRACTING_CONTENT = 'EXTRACTING_CONTENT',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ErrorResult {
  error: string;
  message: string;
  code?: string;
  details?: any;
}
