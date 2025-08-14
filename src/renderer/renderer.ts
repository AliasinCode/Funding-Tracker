// Simple button handler
document.addEventListener('DOMContentLoaded', () => {
  const openPdfBtn = document.getElementById('openPdfBtn');
  if (openPdfBtn) {
    openPdfBtn.addEventListener('click', () => {
      const api = (window as any).electronAPI;
      if (api) {
        api.openPDFDialog();
      }
    });
  }
});
