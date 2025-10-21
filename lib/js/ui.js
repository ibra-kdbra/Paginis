$(document).ready(function () {
    // Show/Hide the input panel
    $("#togglePanelBtn").click(function () {
        $("#inputPanel").toggleClass("hidden");
        if ($("#inputPanel").hasClass("hidden")) {
            $(this).html('<i class="fas fa-cog"></i>').attr("title", "Show Options Panel");
        } else {
            $(this).html('<i class="fas fa-cog"></i>').attr("title", "Hide Options Panel");
        }
    });

    // Handle the PDF source selection
    $("#pdfSource").change(function () {
        var selectedSource = $(this).val();
        $("#urlInputField").toggleClass("hidden", selectedSource !== "url");
        $("#fileInputField").toggleClass("hidden", selectedSource !== "local");
    });

    // Load the PDF based on selected source
    $("#loadPdfBtn").click(function () {
        const selectedSource = $("#pdfSource").val();

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
        if (isRTL) {
            $(this).html('<i class="fas fa-exchange-alt"></i>').attr("title", "Switch to LTR");
        } else {
            $(this).html('<i class="fas fa-exchange-alt"></i>').attr("title", "Switch to RTL");
        }
    });
});
