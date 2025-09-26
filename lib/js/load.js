var isRTL = false;  // Default to LTR
var currentPdf = 'https://utfs.io/f/aLxFAGHMpUDrHJi2MUlQmdfILsR4SYX9vh5tGa0AxUy31OwF'; // Default PDF URL

// Function to load the flipbook
function loadFlipbook(pdfUrl, rtlMode, page) {
    var options = {
        height: "100%",
        duration: 700,
        backgroundColor: "#2F2D2F",
        direction: rtlMode ? 2 : 1, // Use 2 for RTL and 1 for LTR
        zoomChange: function (isZoomed) {
            $("body").css("overflow", isZoomed ? "hidden" : "auto");
        },
        openPage: page || 1
    };

    $("#flipbookContainer").empty();
    $("#flipbookContainer").flipBook(pdfUrl, options);
}

// Initial call to load the flipbook
$(document).ready(function () {
    var urlParams = new URLSearchParams(window.location.search);
    var pdfFromUrl = urlParams.get('pdf');
    var pageFromUrl = parseInt(urlParams.get('page'), 10);

    if (pdfFromUrl) {
        currentPdf = pdfFromUrl;
        loadFlipbook(currentPdf, isRTL, pageFromUrl);
    } else {
        loadFlipbook(currentPdf, isRTL);
    }
});
