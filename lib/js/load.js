var isRTL = false;  // Default to LTR
var currentPdf = 'https://7uzx5yn03h.ufs.sh/f/aLxFAGHMpUDrHJi2MUlQmdfILsR4SYX9vh5tGa0AxUy31OwF'; // Default PDF URL

// Function to load the flipbook
function loadFlipbook(pdfUrl, rtlMode, page, pdfId) {
    // Validate PDF URL
    if (!pdfUrl || pdfUrl.trim() === '') {
        console.error('Invalid PDF URL provided to loadFlipbook');
        $("#flipbookContainer").html('<div style="color: red; padding: 20px; text-align: center;">Invalid PDF URL provided.</div>');
        Toastify({
            text: "Invalid PDF URL provided.",
            duration: 4000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#ef4444"
        }).showToast();
        return;
    }

    var options = {
        height: "100%",
        duration: 700,
        backgroundColor: "#2F2D2F",
        direction: rtlMode ? 2 : 1, // Use 2 for RTL and 1 for LTR
        zoomChange: function (isZoomed) {
            $("body").css("overflow", isZoomed ? "hidden" : "auto");
        },
        openPage: page || 1,
        pdfId: pdfId || pdfUrl,
        onReady: function(book) {
            // Ensure book is properly initialized
            if (book && typeof book.pageCount !== 'undefined') {
                console.log('PDF loaded successfully with', book.pageCount, 'pages');
            }
        },
    };

    $("#flipbookContainer").empty();

    // Add error handling for PDF loading
    try {
        $("#flipbookContainer").flipBook(pdfUrl, options);
    } catch (error) {
        console.error('Error initializing flipbook:', error);
        // Show error message to user
        $("#flipbookContainer").html('<div style="color: red; padding: 20px; text-align: center;">Error loading PDF. Please check the console for details.</div>');
        Toastify({
            text: "Error loading PDF. Please check the URL and try again.",
            duration: 5000,
            gravity: "bottom",
            position: "right",
            backgroundColor: "#ef4444"
        }).showToast();
        return;
    }

    // Update global PDF context
    updatePdfContext(pdfUrl, pdfId);
}

// Function to update PDF context globally
function updatePdfContext(pdfUrl, pdfId) {
    // Update global variables
    currentPdf = pdfUrl;
    window.currentPdf = pdfUrl;

    // Determine PDF type and name
    let pdfType = 'url';
    let pdfName = '';
    let storageValue = pdfUrl; 

    if (pdfUrl.startsWith('blob:')) {
        pdfType = 'local';
        pdfName = pdfId || 'Local PDF';
        storageValue = pdfId || 'Local PDF'; // Store filename, not blob URL
    } else {
        pdfType = 'url';
        try {
            const url = new URL(pdfUrl);
            pdfName = url.hostname;
        } catch (e) {
            pdfName = pdfUrl.substring(0, 50) + '...';
        }
        storageValue = pdfUrl; // Store the URL
    }

    window.currentPdfType = pdfType;

    // Store in localStorage (never store blob URLs)
    localStorage.setItem('lastOpenedPDF', storageValue);
    localStorage.setItem('lastOpenedPDFType', pdfType);

    // Update quotes context if available
    if (window.updateCurrentPdfContext) {
        window.updateCurrentPdfContext();
    }

    // Update UI elements
    updatePdfInfoDisplay(pdfName, pdfType);
}

function updatePdfInfoDisplay(pdfName, pdfType) {
    // Update any PDF info displays in the UI
    const pdfInfoElements = document.querySelectorAll('[data-pdf-info]');
    pdfInfoElements.forEach(element => {
        if (pdfName) {
            element.textContent = `${pdfType === 'local' ? '📁' : '🌐'} ${pdfName}`;
            element.style.display = 'inline';
        } else {
            element.style.display = 'none';
        }
    });
}

function showThemedLocalFileToast(filename) {
    const currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : 'default';

    // Get theme-appropriate colors
    const themeColors = getThemeToastColors(currentTheme);

    // Check if the right panel is open to adjust positioning
    const isPanelOpen = $("#unifiedPanel").hasClass("open");
    const toastPosition = isPanelOpen ? "left" : "right";

    // Create toast with close button
    const toast = Toastify({
        text: `<div style="position: relative; padding-right: 30px;">
            <div>Last read: "${filename}". Please re-select it to continue.</div>
            <button id="toast-close-btn" style="
                position: absolute;
                top: 5px;
                right: 5px;
                background: none;
                border: none;
                color: ${themeColors.text};
                font-size: 16px;
                cursor: pointer;
                padding: 2px;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.7;
                transition: opacity 0.2s;
            " onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">×</button>
        </div>`,
        duration: 6000, // Longer duration since user can close manually
        gravity: "bottom",
        position: toastPosition,
        escapeMarkup: false, // Allow HTML
        style: {
            background: themeColors.background,
            color: themeColors.text,
            border: `1px solid ${themeColors.border}`,
            borderRadius: "8px",
            boxShadow: themeColors.shadow,
            maxWidth: "400px",
            fontFamily: "inherit"
        },
        onClick: function() {
            // Handle close button click
            const closeBtn = document.getElementById('toast-close-btn');
            if (closeBtn && closeBtn.contains(event.target)) {
                toast.hideToast();
            }
        }
    });

    toast.showToast();
}

// Function to get theme-appropriate colors for toast
function getThemeToastColors(theme) {
    const themeColors = {
        'default': {
            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
            text: '#ffffff',
            border: '#2563eb',
            shadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
        },
        'dark': {
            background: 'linear-gradient(135deg, #374151, #1f2937)',
            text: '#f9fafb',
            border: '#4b5563',
            shadow: '0 8px 25px rgba(0, 0, 0, 0.5)'
        },
        'light': {
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
            text: '#1f2937',
            border: '#e2e8f0',
            shadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
        },
        'purple': {
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            text: '#ffffff',
            border: '#8b5cf6',
            shadow: '0 8px 25px rgba(147, 51, 234, 0.3)'
        },
        'green': {
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            text: '#ffffff',
            border: '#16a34a',
            shadow: '0 8px 25px rgba(34, 197, 94, 0.3)'
        },
        'red': {
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            text: '#ffffff',
            border: '#dc2626',
            shadow: '0 8px 25px rgba(239, 68, 68, 0.3)'
        },
        'orange': {
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            text: '#ffffff',
            border: '#ea580c',
            shadow: '0 8px 25px rgba(249, 115, 22, 0.3)'
        },
        'pink': {
            background: 'linear-gradient(135deg, #ec4899, #db2777)',
            text: '#ffffff',
            border: '#db2777',
            shadow: '0 8px 25px rgba(236, 72, 153, 0.3)'
        },
        'cyan': {
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            text: '#ffffff',
            border: '#0891b2',
            shadow: '0 8px 25px rgba(6, 182, 212, 0.3)'
        },
        'indigo': {
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            text: '#ffffff',
            border: '#4f46e5',
            shadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
        },
        'yellow': {
            background: 'linear-gradient(135deg, #eab308, #ca8a04)',
            text: '#1f2937',
            border: '#ca8a04',
            shadow: '0 8px 25px rgba(234, 179, 8, 0.3)'
        },
        'gray': {
            background: 'linear-gradient(135deg, #6b7280, #4b5563)',
            text: '#ffffff',
            border: '#4b5563',
            shadow: '0 8px 25px rgba(107, 114, 128, 0.3)'
        }
    };

    return themeColors[theme] || themeColors['default'];
}

// Initial call to load the flipbook
$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search);
    var pdfFromUrl = urlParams.get('pdf');
    var pageFromUrl = parseInt(urlParams.get('page'), 10);

    var lastOpenedPDF = localStorage.getItem('lastOpenedPDF');
    var lastOpenedPDFType = localStorage.getItem('lastOpenedPDFType');

    var pdfId;
    var pdfToLoad = currentPdf; // Default to the configured PDF URL

    if (pdfFromUrl) {
        pdfToLoad = pdfFromUrl;
        pdfId = pdfFromUrl;
    } else if (lastOpenedPDF && lastOpenedPDF.trim() !== '' &&
               ((lastOpenedPDFType === 'url' && !lastOpenedPDF.startsWith('blob:')) ||
                lastOpenedPDFType === 'local')) {
        // Load from localStorage: URL PDFs (not blob URLs) or local file references
        if (lastOpenedPDFType === 'local') {
            // For local files, show a themed message with close button
            showThemedLocalFileToast(lastOpenedPDF);
            pdfId = lastOpenedPDF;
            pdfToLoad = currentPdf; // Fall back to default PDF
        } else {
            // For URL PDFs, load them directly
            pdfToLoad = lastOpenedPDF;
            pdfId = lastOpenedPDF;
        }
    } else {
        pdfId = currentPdf;
        pdfToLoad = currentPdf;
    }

    // Ensure we always have a valid PDF URL
    if (!pdfToLoad || pdfToLoad.trim() === '') {
        console.warn('PDF URL was empty, using default');
        pdfToLoad = currentPdf;
        pdfId = currentPdf;
    }

    // Update currentPdf to reflect what we're actually loading
    currentPdf = pdfToLoad;

    // Check if page is specified in URL
    if (!isNaN(pageFromUrl)) {
        // If page is in URL params, use that
        loadFlipbook(pdfToLoad, isRTL, pageFromUrl, pdfId);
        // Update debug info on load
        window.getLastPage(pdfId).then(function(storedPage) {
            $('#storedPage').text(storedPage || 'N/A');
        });
    } else {
        // If no page in URL, try to get from IndexedDB
        window.getLastPage(pdfId).then(function(storedPage) {
            $('#storedPage').text(storedPage || 'N/A');
            loadFlipbook(pdfToLoad, isRTL, storedPage || 1, pdfId);
        }).catch(function(error) {
            // Load with page 1 if IndexedDB fails
            loadFlipbook(pdfToLoad, isRTL, 1, pdfId);
        });
    }
});
