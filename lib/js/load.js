jQuery(document).ready(function () {
    // Initialize variables
    let isRTL = false; // Default to LTR
    let currentPdf = 'https://utfs.io/f/aLxFAGHMpUDrHJi2MUlQmdfILsR4SYX9vh5tGa0AxUy31OwF'; // Initial PDF

    // Initially hide the input panel and set the button text
    $("#inputPanel").addClass("hidden");
    $("#togglePanelBtn").text("Show Options");

    // Load Flipbook function with RTL support
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

        // Debugging: Log RTL mode status to confirm it's being set
        console.log("Loading Flipbook with RTL mode:", rtlMode);

        // Remove any existing flipbook instance to avoid duplications
        $("#flipbookContainer").empty();

        // Load the flipbook with the new PDF URL and options
        $("#flipbookContainer").flipBook(pdfUrl, options);
    }

    // Initial load with default PDF in LTR mode
    loadFlipbook(currentPdf, isRTL);

    // Toggle the input panel visibility
    $("#togglePanelBtn").click(function () {
        $("#inputPanel").toggleClass("hidden");
        $(this).text($("#inputPanel").hasClass("hidden") ? "Show Options" : "Hide Options");
    });

    // Show/Hide input fields based on selection (URL or local)
    $("#pdfSource").change(function () {
        var selectedSource = $(this).val();
        $("#urlInputField").toggleClass("hidden", selectedSource !== "url");
        $("#fileInputField").toggleClass("hidden", selectedSource !== "local");
    });

    // Load PDF on button click
    $("#loadPdfBtn").click(function () {
        const selectedSource = $("#pdfSource").val();
        if (selectedSource === "url") {
            const newPdfUrl = $("#pdfUrl").val();
            if (newPdfUrl) {
                currentPdf = newPdfUrl; // Update current PDF
                loadFlipbook(currentPdf, isRTL); // Load with current direction
            } else {
                alert("Please enter a valid PDF URL.");
            }
        } else if (selectedSource === "local") {
            const file = document.getElementById("pdfFile").files[0];
            if (file) {
                currentPdf = URL.createObjectURL(file); // Update current PDF
                loadFlipbook(currentPdf, isRTL); // Load with current direction
            } else {
                alert("Please select a valid PDF file.");
            }
        }
    });

    // Toggle direction between LTR and RTL on button click
    $("#toggleDirectionBtn").click(function () {
        isRTL = !isRTL; // Toggle RTL mode
        loadFlipbook(currentPdf, isRTL); // Reload with updated RTL setting and current PDF
        // Update the button text to reflect the current mode
        $(this).text(isRTL ? "Switch to LTR" : "Switch to RTL");
    });

    // Load YouTube video or playlist on button click
    $("#loadYoutubeBtn").click(function () {
        const youtubeUrl = $("#youtubeUrl").val();
        const videoId = youtubeUrl.split("v=")[1]?.split("&")[0];
        const playlistId = youtubeUrl.split("list=")[1]?.split("&")[0];

        if (videoId) {
            $("#youtubePlayer").attr("src", `https://www.youtube.com/embed/${videoId}`);
            $("#mediaContainer").css("display", "flex");
            $(this).text("Load Video");
        } else if (playlistId) {
            $("#youtubePlayer").attr("src", `https://www.youtube.com/embed/videoseries?list=${playlistId}`);
            $("#mediaContainer").css("display", "flex");
            $(this).text("Load Playlist");
        } else {
            alert("Please enter a valid YouTube video or playlist URL.");
        }
    });

    // Close media container
    $("#closeMediaContainer").click(function () {
        $("#youtubePlayer").attr("src", "");
        $("#mediaContainer").css("display", "none");
    });
});
