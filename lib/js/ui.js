$(document).ready(function () {
    // Unified Panel Management
    let panelAutoHideTimer;
    let isPanelOpen = false;

    // Toggle unified panel
    function toggleUnifiedPanel() {
        const panel = $("#unifiedPanel");
        const toggleBtn = $("#toggleUnifiedPanelBtn");
        const body = $("body");

        isPanelOpen = !isPanelOpen;
        panel.toggleClass("open", isPanelOpen);
        body.toggleClass("panel-open", isPanelOpen);

        if (isPanelOpen) {
            toggleBtn.html('<i class="fas fa-times"></i>').attr("title", "Close Control Panel");
            startAutoHideTimer();
            panel.addClass("panel-enhanced");
            // Add slight delay for smooth animation
            setTimeout(() => {
                panel.addClass("panel-fade-in");
            }, 50);
        } else {
            toggleBtn.html('<i class="fas fa-bars"></i>').attr("title", "Open Control Panel");
            clearAutoHideTimer();
            body.removeClass("panel-open");
            panel.removeClass("panel-fade-in");
        }
    }

    // Start auto-hide timer
    function startAutoHideTimer() {
        clearAutoHideTimer();
        panelAutoHideTimer = setTimeout(() => {
            if (isPanelOpen) {
                toggleUnifiedPanel();
            }
        }, 5000);
    }

    // Clear auto-hide timer
    function clearAutoHideTimer() {
        if (panelAutoHideTimer) {
            clearTimeout(panelAutoHideTimer);
            panelAutoHideTimer = null;
        }
    }

    // Reset auto-hide timer on user activity
    function resetAutoHideTimer() {
        if (isPanelOpen) {
            startAutoHideTimer();
        }
    }

    // Panel event listeners
    $("#toggleUnifiedPanelBtn").click(toggleUnifiedPanel);
    $("#closeUnifiedPanelBtn").click(toggleUnifiedPanel);

    // Reset timer on panel interactions
    $("#unifiedPanel").on("mouseenter focusin", function() {
        clearAutoHideTimer();
    }).on("mouseleave focusout", function() {
        startAutoHideTimer();
    });

    // Handle clicks outside panel to close it
    $(document).on("click", function(event) {
        const panel = $("#unifiedPanel");
        const toggleBtn = $("#toggleUnifiedPanelBtn");

        if (isPanelOpen && !panel.is(event.target) && !panel.has(event.target).length &&
            !toggleBtn.is(event.target) && !toggleBtn.has(event.target).length) {
            toggleUnifiedPanel();
        }
    });

    // Handle the PDF source selection
    // Load PDF from URL
    $("#loadPdfUrlBtn").click(function () {
        const newPdfUrl = window.ValidationUtils.sanitizeInput($("#pdfUrl").val());

        if (!newPdfUrl) {
            Toastify({
                text: "Please enter a PDF URL.",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#ef4444"
            }).showToast();
            return;
        }

        if (!window.ValidationUtils.isValidUrl(newPdfUrl)) {
            Toastify({
                text: "Please enter a valid URL.",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#ef4444"
            }).showToast();
            return;
        }

        if (!window.ValidationUtils.isValidPdfUrl(newPdfUrl)) {
            Toastify({
                text: "URL doesn't appear to point to a PDF file.",
                duration: 3000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#f59e0b"
            }).showToast();
            // Still allow loading as it might be a valid PDF with different extension
        }

        currentPdf = newPdfUrl;
        localStorage.setItem('lastOpenedPDF', currentPdf);
        localStorage.setItem('lastOpenedPDFType', 'url');
        window.getLastPage(currentPdf).then(function(storedPage) {
            $('#storedPage').text(storedPage || 'N/A');
            loadFlipbook(currentPdf, isRTL, storedPage || 1, currentPdf);
        });
        resetAutoHideTimer();
    });

    // Load PDF from local file - opens file picker automatically
    $("#loadPdfFileBtn").click(function () {
        $("#pdfFile").click();
        resetAutoHideTimer();
    });

    // Handle file selection
    $("#pdfFile").change(function () {
        const file = this.files[0];
        const validation = window.ValidationUtils.validatePdfFile(file);

        if (!validation.isValid) {
            Toastify({
                text: validation.error,
                duration: 4000,
                gravity: "bottom",
                position: "right",
                backgroundColor: "#ef4444"
            }).showToast();
            return;
        }

        const fileName = file.name;
        currentPdf = URL.createObjectURL(file);
        localStorage.setItem('lastOpenedPDF', fileName);
        localStorage.setItem('lastOpenedPDFType', 'local');
        window.getLastPage(fileName).then(function(storedPage) {
            $('#storedPage').text(storedPage || 'N/A');
            loadFlipbook(currentPdf, isRTL, storedPage || 1, fileName);
        });
    });

    // Toggle between RTL and LTR
    $("#toggleDirectionBtn").click(function () {
        const newIsRTL = window.appState.toggleRTL();  // Toggle using state management
        isRTL = newIsRTL;  // Update local variable for backward compatibility
        loadFlipbook(currentPdf, isRTL);
        resetAutoHideTimer();

        if (isRTL) {
            $(this).html('<i class="fas fa-exchange-alt"></i>').attr("title", "Switch to LTR");
        } else {
            $(this).html('<i class="fas fa-exchange-alt"></i>').attr("title", "Switch to RTL");
        }
    });

    // Keyboard shortcuts
    $(document).on("keydown", function(event) {
        // Ctrl/Cmd + K to toggle panel
        if ((event.ctrlKey || event.metaKey) && event.key === "k") {
            event.preventDefault();
            toggleUnifiedPanel();
        }

        // Escape to close panel
        if (event.key === "Escape" && isPanelOpen) {
            toggleUnifiedPanel();
        }
    });

    // Initialize panel as closed
    $("#unifiedPanel").removeClass("open");
});
