import { PDFProcessingResult, DocumentSection, DocumentType } from '../shared/types';

// Global interface for Electron API
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

class DocumentParserUI {
  private currentDocument: PDFProcessingResult | null = null;
  private selectedSections: Set<string> = new Set();

  // DOM elements
  private welcomeState!: HTMLElement;
  private processingState!: HTMLElement;
  private resultsState!: HTMLElement;
  private errorState!: HTMLElement;
  private loadingOverlay!: HTMLElement;
  private notificationToast!: HTMLElement;

  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.setupElectronListeners();
  }

  private initializeElements(): void {
    this.welcomeState = document.getElementById('welcomeState')!;
    this.processingState = document.getElementById('processingState')!;
    this.resultsState = document.getElementById('resultsState')!;
    this.errorState = document.getElementById('errorState')!;
    this.loadingOverlay = document.getElementById('loadingOverlay')!;
    this.notificationToast = document.getElementById('notificationToast')!;
  }

  private bindEvents(): void {
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
    } else {
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

  private setupElectronListeners(): void {
    console.log('Setting up Electron listeners...');
    if (window.electronAPI) {
      console.log('electronAPI found, setting up listeners...');
      
      // PDF processing events
      window.electronAPI.onPDFProcessingStarted(() => {
        console.log('Received pdf-processing-started event');
        this.showProcessingState();
        this.updateProcessingStep(1);
      });

      window.electronAPI.onPDFProcessingComplete((result: PDFProcessingResult) => {
        console.log('Received pdf-processing-complete event:', result);
        this.currentDocument = result;
        this.showResultsState();
        this.populateResults(result);
        this.updateProcessingStep(4);
        this.showNotification('Document processed successfully!', 'success');
      });

      window.electronAPI.onPDFProcessingError((error: string) => {
        console.log('Received pdf-processing-error event:', error);
        this.showErrorState(error);
        this.showNotification('Error processing document', 'error');
      });

      window.electronAPI.onExportExcel(() => {
        console.log('Received export-excel event');
        this.exportToExcel();
      });
    } else {
      console.error('electronAPI not found!');
    }
  }

  private async openPDFDialog(): Promise<void> {
    try {
      console.log('openPDFDialog called');
      if (window.electronAPI) {
        console.log('electronAPI found, calling openPDFDialog...');
        const result = await window.electronAPI.openPDFDialog();
        console.log('openPDFDialog result:', result);
      } else {
        console.error('electronAPI not found!');
      }
    } catch (error) {
      console.error('Error opening PDF dialog:', error);
      this.showNotification('Error opening file dialog', 'error');
    }
  }

  private async exportToExcel(): Promise<void> {
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
        } else {
          this.showNotification(result.message || 'Export failed', 'error');
        }
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      this.showNotification('Error exporting to Excel', 'error');
    }
  }

  private getSelectedSectionsData(): DocumentSection[] {
    if (!this.currentDocument) return [];

    const selected: DocumentSection[] = [];
    
    const processSection = (section: DocumentSection) => {
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

  private selectAllSections(): void {
    if (!this.currentDocument) return;

    this.selectedSections.clear();
    
    const selectSection = (section: DocumentSection) => {
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

  private clearSelection(): void {
    this.selectedSections.clear();
    this.updateSelectionUI();
    this.updateExportButton();
  }

  private updateSelectionUI(): void {
    // Update checkboxes
    document.querySelectorAll('.section-checkbox').forEach((checkbox: Element) => {
      const input = checkbox as HTMLInputElement;
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

  private countTotalSections(sections: DocumentSection[]): number {
    let count = 0;
    for (const section of sections) {
      count++;
      count += this.countTotalSections(section.subsections);
    }
    return count;
  }

  private updateExportButton(): void {
    const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
    if (exportBtn) {
      exportBtn.disabled = this.selectedSections.size === 0;
    }
  }

  private showWelcomeState(): void {
    this.hideAllStates();
    this.welcomeState.classList.remove('hidden');
  }

  private showProcessingState(): void {
    this.hideAllStates();
    this.processingState.classList.remove('hidden');
    this.startProcessingAnimation();
  }

  private showResultsState(): void {
    this.hideAllStates();
    this.resultsState.classList.remove('hidden');
  }

  private showErrorState(error: string): void {
    this.hideAllStates();
    this.errorState.classList.remove('hidden');
    
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.textContent = error;
    }
  }

  private hideAllStates(): void {
    this.welcomeState.classList.add('hidden');
    this.processingState.classList.add('hidden');
    this.resultsState.classList.add('hidden');
    this.errorState.classList.add('hidden');
  }

  private startProcessingAnimation(): void {
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    
    const animate = () => {
      progress += Math.random() * 15;
      if (progress > 90) progress = 90;
      
      if (progressFill) {
        progressFill.style.width = `${progress}%`;
      }
      
      if (progress < 90) {
        setTimeout(animate, 500 + Math.random() * 1000);
      }
    };
    
    animate();
  }

  private updateProcessingStep(step: number): void {
    for (let i = 1; i <= 4; i++) {
      const stepElement = document.getElementById(`step${i}`);
      if (stepElement) {
        stepElement.classList.remove('active', 'completed');
        if (i < step) {
          stepElement.classList.add('completed');
        } else if (i === step) {
          stepElement.classList.add('active');
        }
      }
    }
  }

  private populateResults(result: PDFProcessingResult): void {
    // Update document info
    const documentTitle = document.getElementById('documentTitle');
    const documentType = document.getElementById('documentType');
    const pageCount = document.getElementById('pageCount');
    const processingTime = document.getElementById('processingTime');

    if (documentTitle) documentTitle.textContent = result.fileName;
    if (documentType) documentType.textContent = result.documentType;
    if (pageCount) pageCount.textContent = `${result.totalPages} pages`;
    if (processingTime) processingTime.textContent = `${result.processingTime}ms`;

    // Populate sections tree
    this.populateSectionsTree(result.sections);

    // Update counts
    this.updateSelectionUI();
    this.updateExportButton();
  }

  private populateSectionsTree(sections: DocumentSection[]): void {
    const sectionsTree = document.getElementById('sectionsTree');
    if (!sectionsTree) return;

    sectionsTree.innerHTML = '';
    
    for (const section of sections) {
      const sectionElement = this.createSectionElement(section);
      sectionsTree.appendChild(sectionElement);
    }
  }

  private createSectionElement(section: DocumentSection): HTMLElement {
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
      this.toggleSectionSelection(section.id, (e.target as HTMLInputElement).checked);
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

  private toggleSection(sectionId: string): void {
    const sectionItem = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (!sectionItem) return;

    const content = sectionItem.querySelector('.section-content');
    const toggle = sectionItem.querySelector('.section-toggle');
    
    if (content && toggle) {
      content.classList.toggle('expanded');
      toggle.classList.toggle('expanded');
    }
  }

  private toggleSectionSelection(sectionId: string, selected: boolean): void {
    if (selected) {
      this.selectedSections.add(sectionId);
    } else {
      this.selectedSections.delete(sectionId);
    }
    
    this.updateSelectionUI();
    this.updateExportButton();
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    const toast = this.notificationToast;
    const messageElement = toast.querySelector('.toast-message');
    const iconElement = toast.querySelector('.toast-icon');
    
    if (messageElement) messageElement.textContent = message;
    
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

  private showLoadingOverlay(): void {
    this.loadingOverlay.classList.remove('hidden');
  }

  private hideLoadingOverlay(): void {
    this.loadingOverlay.classList.add('hidden');
  }
}

// Initialize the UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DocumentParserUI();
});
