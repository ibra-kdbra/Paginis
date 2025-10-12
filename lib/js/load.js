var isRTL = false;  // Default to LTR
var currentPdf = 'https://utfs.io/f/aLxFAGHMpUDrHJi2MUlQmdfILsR4SYX9vh5tGa0AxUy31OwF'; // Default PDF URL

// Function to load the flipbook
function loadFlipbook(pdfUrl, rtlMode, page, pdfId) {
    var options = {
        height: "100%",
        duration: 700,
        backgroundColor: "#2F2D2F",
        direction: rtlMode ? 2 : 1, // Use 2 for RTL and 1 for LTR
        zoomChange: function (isZoomed) {
            $("body").css("overflow", isZoomed ? "hidden" : "auto");
        },
        openPage: page || 1,
        pdfId: pdfId || pdfUrl
    };

    $("#flipbookContainer").empty();
    $("#flipbookContainer").flipBook(pdfUrl, options);
}

// Initial call to load the flipbook
$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search);
    var pdfFromUrl = urlParams.get('pdf');
    var pageFromUrl = parseInt(urlParams.get('page'), 10);

    var lastOpenedPDF = localStorage.getItem('lastOpenedPDF');
    var lastOpenedPDFType = localStorage.getItem('lastOpenedPDFType');

    var pdfId;
    if (pdfFromUrl) {
        currentPdf = pdfFromUrl;
        pdfId = currentPdf;
    } else if (lastOpenedPDF && lastOpenedPDFType === 'url') {
        currentPdf = lastOpenedPDF;
        pdfId = currentPdf;
    } else if (lastOpenedPDF && lastOpenedPDFType === 'local') {
        // For local files, we can't automatically reload the file.
        // We can, however, pre-fill the file input or show a message.
        Toastify({
            text: 'Last read: "' + lastOpenedPDF + '". Please re-select it to continue.',
            duration: 6000,
            gravity: "bottom",
            position: "right",
            style: {
                background: "linear-gradient(to right, #f39c12, #e67e22)",
                maxWidth: "350px"
            }
        }).showToast();
        pdfId = lastOpenedPDF;
    } else {
        pdfId = currentPdf;
    }


    // Check if page is specified in URL
    if (!isNaN(pageFromUrl)) {
        // If page is in URL params, use that
        loadFlipbook(currentPdf, isRTL, pageFromUrl, pdfId);
        // Update debug info on load
        window.getLastPage(pdfId).then(function(storedPage) {
            $('#storedPage').text(storedPage || 'N/A');
        });
    } else {
        // If no page in URL, try to get from IndexedDB
        window.getLastPage(pdfId).then(function(storedPage) {
            $('#storedPage').text(storedPage || 'N/A');
            loadFlipbook(currentPdf, isRTL, storedPage || 1, pdfId);
        });
    }
});
