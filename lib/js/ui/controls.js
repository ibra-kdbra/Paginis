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
        const button = $(this);
        const originalText = button.html();

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

        // Show loading state
        button.html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);
        button.closest('.input-field').find('input').prop('disabled', true);

        // Add loading overlay to flipbook container
        const container = $("#flipbookContainer");
        container.append(`
            <div id="loadingOverlay" style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                color: white;
            ">
                <div style="text-align: center;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <div>Loading PDF...</div>
                </div>
            </div>
        `);

        // Update AppState with PDF context for URL
        let hostname = '';
        try {
            const urlObj = new URL(newPdfUrl);
            hostname = urlObj.hostname;
        } catch (e) {
            hostname = 'remote-pdf';
        }
        window.appState.updatePdfContext(newPdfUrl, 'url', hostname);

        window.getLastPage(newPdfUrl).then(function(storedPage) {
            $('#storedPage').text(storedPage || 'N/A');
            loadFlipbook(newPdfUrl, window.appState.get('isRTL'), storedPage || 1, newPdfUrl);
            // Restore button after PDF starts loading
            setTimeout(() => {
                button.html(originalText).prop('disabled', false);
                button.closest('.input-field').find('input').prop('disabled', false);
                $('#loadingOverlay').fadeOut(300, function() { $(this).remove(); });
            }, 1000);
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
        const fileUrl = URL.createObjectURL(file);
        // Update AppState with PDF context for local file
        window.appState.updatePdfContext(fileUrl, 'local', fileName);
        window.getLastPage(fileName).then(function(storedPage) {
            $('#storedPage').text(storedPage || 'N/A');
            loadFlipbook(fileUrl, window.appState.get('isRTL'), storedPage || 1, fileName);
        });
    });

    // Toggle between RTL and LTR
    $("#toggleDirectionBtn").click(function () {
        const newIsRTL = window.appState.toggleRTL();  // Toggle using state management
        const currentPdf = window.appState.get('currentPdf');
        if (currentPdf) {
            loadFlipbook(currentPdf, newIsRTL, window.appState.get('lastPage') || 1, currentPdf);
        }
        resetAutoHideTimer();

        if (newIsRTL) {
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
