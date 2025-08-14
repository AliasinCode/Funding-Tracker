"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingStage = exports.DocumentType = void 0;
var DocumentType;
(function (DocumentType) {
    DocumentType["ECCA"] = "ECCA";
    DocumentType["MIPA"] = "MIPA";
    DocumentType["LLCA"] = "LLCA";
    DocumentType["UNKNOWN"] = "UNKNOWN";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var ProcessingStage;
(function (ProcessingStage) {
    ProcessingStage["INITIALIZING"] = "INITIALIZING";
    ProcessingStage["EXTRACTING_TEXT"] = "EXTRACTING_TEXT";
    ProcessingStage["DETECTING_TOC"] = "DETECTING_TOC";
    ProcessingStage["PARSING_SECTIONS"] = "PARSING_SECTIONS";
    ProcessingStage["EXTRACTING_CONTENT"] = "EXTRACTING_CONTENT";
    ProcessingStage["COMPLETED"] = "COMPLETED";
    ProcessingStage["ERROR"] = "ERROR";
})(ProcessingStage || (exports.ProcessingStage = ProcessingStage = {}));
//# sourceMappingURL=types.js.map