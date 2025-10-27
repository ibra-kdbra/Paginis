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
    $("#pdfSource").change(function () {
        var selectedSource = $(this).val();
        $("#urlInputField").toggleClass("hidden", selectedSource !== "url");
        $("#fileInputField").toggleClass("hidden", selectedSource !== "local");
        resetAutoHideTimer();
    });

    // Handle settings toggle
    $("#settingsToggle").change(function () {
        const isEnabled = $(this).is(":checked");
        const themeSelector = $(".theme-selector");

        if (isEnabled) {
            themeSelector.slideDown(300);
        } else {
            themeSelector.slideUp(300);
        }
        resetAutoHideTimer();
    });

    // Handle YouTube integration toggle
    $("#youtubeToggle").change(function () {
        const isEnabled = $(this).is(":checked");
        const youtubeInput = $("#youtubeUrl").closest(".input-field");
        const loadYoutubeBtn = $("#loadYoutubeBtn");

        if (isEnabled) {
            youtubeInput.show();
            loadYoutubeBtn.show();
        } else {
            youtubeInput.hide();
            loadYoutubeBtn.hide();
        }
        resetAutoHideTimer();
    });

    // Load the PDF based on selected source
    $("#loadPdfBtn, #loadPdfBtnAlt").click(function () {
        const selectedSource = $("#pdfSource").val();
        resetAutoHideTimer();

        if (selectedSource === "url") {
            const newPdfUrl = $("#pdfUrl").val();
            if (newPdfUrl) {
                currentPdf = newPdfUrl;
                localStorage.setItem('lastOpenedPDF', currentPdf);
                localStorage.setItem('lastOpenedPDFType', 'url');
                window.getLastPage(currentPdf).then(function(storedPage) {
                    $('#storedPage').text(storedPage || 'N/A');
                    loadFlipbook(currentPdf, isRTL, storedPage || 1, currentPdf);
                });
            } else {
                alert("Please enter a valid PDF URL.");
            }
        } else if (selectedSource === "local") {
            const file = document.getElementById("pdfFile").files[0];
            if (file) {
                const fileName = file.name;
                currentPdf = URL.createObjectURL(file);
                localStorage.setItem('lastOpenedPDF', fileName);
                localStorage.setItem('lastOpenedPDFType', 'local');
                window.getLastPage(fileName).then(function(storedPage) {
                    $('#storedPage').text(storedPage || 'N/A');
                    loadFlipbook(currentPdf, isRTL, storedPage || 1, fileName);
                });
            } else {
                alert("Please select a valid PDF file.");
            }
        }
    });

    // Toggle between RTL and LTR
    $("#toggleDirectionBtn").click(function () {
        isRTL = !isRTL;  // Toggle the RTL flag
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
