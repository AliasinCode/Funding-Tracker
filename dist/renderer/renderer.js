"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DocumentParserUI {
    constructor() {
        this.currentDocument = null;
        this.selectedSections = new Set();
        this.initializeElements();
        this.bindEvents();
        this.setupElectronListeners();
    }
    initializeElements() {
        this.welcomeState = document.getElementById('welcomeState');
        this.processingState = document.getElementById('processingState');
        this.resultsState = document.getElementById('resultsState');
        this.errorState = document.getElementById('errorState');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.notificationToast = document.getElementById('notificationToast');
    }
    bindEvents() {
        // Header button events
        const openPdfBtn = document.getElementById('openPdfBtn');
        console.log('openPdfBtn element:', openPdfBtn);
        if (openPdfBtn) {
            console.log('Adding click listener to openPdfBtn');
            openPdfBtn.addEventListener('click', () => {
                console.log('Button clicked!');
                alert('Button clicked!');
                this.openPDFDialog();
            });
            // Also try a simple test
            openPdfBtn.addEventListener('mousedown', () => {
                console.log('Mouse down on button!');
            });
            openPdfBtn.addEventListener('mouseup', () => {
                console.log('Mouse up on button!');
            });
        }
        else {
            console.error('openPdfBtn element not found!');
        }
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportToExcel();
        });
        // Results state events
        document.getElementById('selectAllBtn')?.addEventListener('click', () => {
            this.selectAllSections();
        });
        document.getElementById('clearSelectionBtn')?.addEventListener('click', () => {
            this.clearSelection();
        });
        // Error state events
        document.getElementById('retryBtn')?.addEventListener('click', () => {
            this.showWelcomeState();
        });
    }
    setupElectronListeners() {
        console.log('Setting up Electron listeners...');
        if (window.electronAPI) {
            console.log('electronAPI found, setting up listeners...');
            // PDF processing events
            window.electronAPI.onPDFProcessingStarted(() => {
                console.log('Received pdf-processing-started event');
                this.showProcessingState();
                this.updateProcessingStep(1);
            });
            window.electronAPI.onPDFProcessingComplete((result) => {
                console.log('Received pdf-processing-complete event:', result);
                this.currentDocument = result;
                this.showResultsState();
                this.populateResults(result);
                this.updateProcessingStep(4);
                this.showNotification('Document processed successfully!', 'success');
            });
            window.electronAPI.onPDFProcessingError((error) => {
                console.log('Received pdf-processing-error event:', error);
                this.showErrorState(error);
                this.showNotification('Error processing document', 'error');
            });
            window.electronAPI.onExportExcel(() => {
                console.log('Received export-excel event');
                this.exportToExcel();
            });
        }
        else {
            console.error('electronAPI not found!');
        }
    }
    async openPDFDialog() {
        try {
            console.log('openPDFDialog called');
            if (window.electronAPI) {
                console.log('electronAPI found, calling openPDFDialog...');
                const result = await window.electronAPI.openPDFDialog();
                console.log('openPDFDialog result:', result);
            }
            else {
                console.error('electronAPI not found!');
            }
        }
        catch (error) {
            console.error('Error opening PDF dialog:', error);
            this.showNotification('Error opening file dialog', 'error');
        }
    }
    async exportToExcel() {
        if (!this.currentDocument || this.selectedSections.size === 0) {
            this.showNotification('Please select sections to export', 'warning');
            return;
        }
        try {
            const exportData = {
                fileName: this.currentDocument.fileName,
                documentType: this.currentDocument.documentType,
                sections: this.getSelectedSectionsData(),
                exportDate: new Date()
            };
            if (window.electronAPI) {
                const result = await window.electronAPI.exportToExcel(exportData);
                if (result.success) {
                    this.showNotification('Excel file exported successfully!', 'success');
                }
                else {
                    this.showNotification(result.message || 'Export failed', 'error');
                }
            }
        }
        catch (error) {
            console.error('Error exporting to Excel:', error);
            this.showNotification('Error exporting to Excel', 'error');
        }
    }
    getSelectedSectionsData() {
        if (!this.currentDocument)
            return [];
        const selected = [];
        const processSection = (section) => {
            if (this.selectedSections.has(section.id)) {
                selected.push(section);
            }
            for (const subsection of section.subsections) {
                processSection(subsection);
            }
        };
        for (const section of this.currentDocument.sections) {
            processSection(section);
        }
        return selected;
    }
    selectAllSections() {
        if (!this.currentDocument)
            return;
        this.selectedSections.clear();
        const selectSection = (section) => {
            this.selectedSections.add(section.id);
            for (const subsection of section.subsections) {
                selectSection(subsection);
            }
        };
        for (const section of this.currentDocument.sections) {
            selectSection(section);
        }
        this.updateSelectionUI();
        this.updateExportButton();
    }
    clearSelection() {
        this.selectedSections.clear();
        this.updateSelectionUI();
        this.updateExportButton();
    }
    updateSelectionUI() {
        // Update checkboxes
        document.querySelectorAll('.section-checkbox').forEach((checkbox) => {
            const input = checkbox;
            input.checked = this.selectedSections.has(input.value);
        });
        // Update counts
        const selectedCount = document.getElementById('selectedCount');
        const totalCount = document.getElementById('totalCount');
        if (selectedCount) {
            selectedCount.textContent = this.selectedSections.size.toString();
        }
        if (totalCount && this.currentDocument) {
            totalCount.textContent = this.countTotalSections(this.currentDocument.sections).toString();
        }
    }
    countTotalSections(sections) {
        let count = 0;
        for (const section of sections) {
            count++;
            count += this.countTotalSections(section.subsections);
        }
        return count;
    }
    updateExportButton() {
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.disabled = this.selectedSections.size === 0;
        }
    }
    showWelcomeState() {
        this.hideAllStates();
        this.welcomeState.classList.remove('hidden');
    }
    showProcessingState() {
        this.hideAllStates();
        this.processingState.classList.remove('hidden');
        this.startProcessingAnimation();
    }
    showResultsState() {
        this.hideAllStates();
        this.resultsState.classList.remove('hidden');
    }
    showErrorState(error) {
        this.hideAllStates();
        this.errorState.classList.remove('hidden');
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = error;
        }
    }
    hideAllStates() {
        this.welcomeState.classList.add('hidden');
        this.processingState.classList.add('hidden');
        this.resultsState.classList.add('hidden');
        this.errorState.classList.add('hidden');
    }
    startProcessingAnimation() {
        let progress = 0;
        const progressFill = document.getElementById('progressFill');
        const animate = () => {
            progress += Math.random() * 15;
            if (progress > 90)
                progress = 90;
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            if (progress < 90) {
                setTimeout(animate, 500 + Math.random() * 1000);
            }
        };
        animate();
    }
    updateProcessingStep(step) {
        for (let i = 1; i <= 4; i++) {
            const stepElement = document.getElementById(`step${i}`);
            if (stepElement) {
                stepElement.classList.remove('active', 'completed');
                if (i < step) {
                    stepElement.classList.add('completed');
                }
                else if (i === step) {
                    stepElement.classList.add('active');
                }
            }
        }
    }
    populateResults(result) {
        // Update document info
        const documentTitle = document.getElementById('documentTitle');
        const documentType = document.getElementById('documentType');
        const pageCount = document.getElementById('pageCount');
        const processingTime = document.getElementById('processingTime');
        if (documentTitle)
            documentTitle.textContent = result.fileName;
        if (documentType)
            documentType.textContent = result.documentType;
        if (pageCount)
            pageCount.textContent = `${result.totalPages} pages`;
        if (processingTime)
            processingTime.textContent = `${result.processingTime}ms`;
        // Populate sections tree
        this.populateSectionsTree(result.sections);
        // Update counts
        this.updateSelectionUI();
        this.updateExportButton();
    }
    populateSectionsTree(sections) {
        const sectionsTree = document.getElementById('sectionsTree');
        if (!sectionsTree)
            return;
        sectionsTree.innerHTML = '';
        for (const section of sections) {
            const sectionElement = this.createSectionElement(section);
            sectionsTree.appendChild(sectionElement);
        }
    }
    createSectionElement(section) {
        const sectionItem = document.createElement('div');
        sectionItem.className = 'section-item';
        sectionItem.dataset.sectionId = section.id;
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        sectionHeader.addEventListener('click', () => this.toggleSection(section.id));
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'section-checkbox';
        checkbox.value = section.id;
        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            this.toggleSectionSelection(section.id, e.target.checked);
        });
        const title = document.createElement('span');
        title.className = 'section-title';
        title.textContent = section.title;
        const page = document.createElement('span');
        page.className = 'section-page';
        page.textContent = `p.${section.pageNumber}`;
        const toggle = document.createElement('i');
        toggle.className = 'fas fa-chevron-right section-toggle';
        sectionHeader.appendChild(checkbox);
        sectionHeader.appendChild(title);
        sectionHeader.appendChild(page);
        sectionHeader.appendChild(toggle);
        sectionItem.appendChild(sectionHeader);
        // Add subsections if they exist
        if (section.subsections.length > 0) {
            const content = document.createElement('div');
            content.className = 'section-content';
            for (const subsection of section.subsections) {
                const subsectionElement = this.createSectionElement(subsection);
                content.appendChild(subsectionElement);
            }
            sectionItem.appendChild(content);
        }
        return sectionItem;
    }
    toggleSection(sectionId) {
        const sectionItem = document.querySelector(`[data-section-id="${sectionId}"]`);
        if (!sectionItem)
            return;
        const content = sectionItem.querySelector('.section-content');
        const toggle = sectionItem.querySelector('.section-toggle');
        if (content && toggle) {
            content.classList.toggle('expanded');
            toggle.classList.toggle('expanded');
        }
    }
    toggleSectionSelection(sectionId, selected) {
        if (selected) {
            this.selectedSections.add(sectionId);
        }
        else {
            this.selectedSections.delete(sectionId);
        }
        this.updateSelectionUI();
        this.updateExportButton();
    }
    showNotification(message, type = 'success') {
        const toast = this.notificationToast;
        const messageElement = toast.querySelector('.toast-message');
        const iconElement = toast.querySelector('.toast-icon');
        if (messageElement)
            messageElement.textContent = message;
        // Update icon and color based on type
        if (iconElement) {
            iconElement.className = 'toast-icon';
            switch (type) {
                case 'success':
                    iconElement.innerHTML = '<i class="fas fa-check-circle"></i>';
                    toast.style.borderLeftColor = '#10b981';
                    break;
                case 'error':
                    iconElement.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
                    toast.style.borderLeftColor = '#ef4444';
                    break;
                case 'warning':
                    iconElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                    toast.style.borderLeftColor = '#f59e0b';
                    break;
            }
        }
        // Show toast
        toast.classList.remove('hidden');
        toast.classList.add('show');
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300);
        }, 3000);
    }
    showLoadingOverlay() {
        this.loadingOverlay.classList.remove('hidden');
    }
    hideLoadingOverlay() {
        this.loadingOverlay.classList.add('hidden');
    }
}
// Initialize the UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DocumentParserUI();
});
//# sourceMappingURL=renderer.js.map