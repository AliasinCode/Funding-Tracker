"use strict";
// Simple button handler
document.addEventListener('DOMContentLoaded', () => {
    const openPdfBtn = document.getElementById('openPdfBtn');
    if (openPdfBtn) {
        openPdfBtn.addEventListener('click', () => {
            const api = window.electronAPI;
            if (api) {
                api.openPDFDialog();
            }
        });
    }
});
//# sourceMappingURL=renderer.js.map