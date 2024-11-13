var isRTL = false;  // Default to LTR
var currentPdf = 'https://utfs.io/f/aLxFAGHMpUDrHJi2MUlQmdfILsR4SYX9vh5tGa0AxUy31OwF'; // Default PDF URL

// Function to load the flipbook
function loadFlipbook(pdfUrl, rtlMode) {
    var options = {
        height: "100%",
        duration: 700,
        backgroundColor: "#2F2D2F",
        direction: rtlMode ? 2 : 1, // Use 2 for RTL and 1 for LTR
        zoomChange: function (isZoomed) {
            $("body").css("overflow", isZoomed ? "hidden" : "auto");
        }
    };

    $("#flipbookContainer").empty();
    $("#flipbookContainer").flipBook(pdfUrl, options);
}

// Initial call to load the flipbook
$(document).ready(function () {
    loadFlipbook(currentPdf, isRTL);
});
