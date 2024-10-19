jQuery(document).ready(function () {
    // Initially hide the input panel and set the button text
    $("#inputPanel").addClass("hidden");
    $("#togglePanelBtn").text("Show Options"); // Set initial button text

    function loadFlipbook(pdfUrl) {
        var options = {
            height: "100%",
            duration: 700,
            backgroundColor: "#2F2D2F",
            zoomChange: function (isZoomed) {
                if (isZoomed) {
                    $("body").css("overflow", "hidden");
                } else {
                    $("body").css("overflow", "auto");
                }
            }
        };

        // Remove any existing flipbook instance to avoid duplications
        $("#flipbookContainer").empty();

        // Load the flipbook with the new PDF URL or blob
        $("#flipbookContainer").flipBook(pdfUrl, options);
    }

    var defaultPdf = 'https://utfs.io/f/aLxFAGHMpUDrHJi2MUlQmdfILsR4SYX9vh5tGa0AxUy31OwF';
    loadFlipbook(defaultPdf);

    // Toggle the input panel visibility
    $("#togglePanelBtn").click(function () {
        $("#inputPanel").toggleClass("hidden");
        if ($("#inputPanel").hasClass("hidden")) {
            $(this).text("Show Options");
        } else {
            $(this).text("Hide Options");
        }
    });

    // Show/Hide input fields based on selection (URL or local)
    $("#pdfSource").change(function () {
        var selectedSource = $(this).val();
        if (selectedSource === "url") {
            $("#urlInputField").removeClass("hidden");
            $("#fileInputField").addClass("hidden");
        } else {
            $("#urlInputField").addClass("hidden");
            $("#fileInputField").removeClass("hidden");
        }
    });

    // Event listener for the button click to load PDF
    $("#loadPdfBtn").click(function () {
        var selectedSource = $("#pdfSource").val();
        if (selectedSource === "url") {
            var newPdfUrl = $("#pdfUrl").val();
            if (newPdfUrl) {
                loadFlipbook(newPdfUrl);
            } else {
                alert("Please enter a valid PDF URL.");
            }
        } else if (selectedSource === "local") {
            var fileInput = document.getElementById("pdfFile");
            var file = fileInput.files[0];
            if (file) {
                var fileUrl = URL.createObjectURL(file);
                loadFlipbook(fileUrl);
            } else {
                alert("Please select a valid PDF file.");
            }
        }
    });

    // Event listener for the button click to load YouTube video or playlist
    $("#loadYoutubeBtn").click(function () {
        var youtubeUrl = $("#youtubeUrl").val();
        var videoId = youtubeUrl.split("v=")[1]?.split("&")[0]; // Extract video ID
        var playlistId = youtubeUrl.split("list=")[1]?.split("&")[0]; // Extract playlist ID

        if (videoId) { // If it's a video URL
            var embedUrl = `https://www.youtube.com/embed/${videoId}`;
            $("#youtubePlayer").attr("src", embedUrl);
            $("#mediaContainer").css("display", "flex");
            $("#loadYoutubeBtn").text("Load Video"); // Change button text to Load Video
        } else if (playlistId) { // If it's a playlist URL
            var embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}`;
            $("#youtubePlayer").attr("src", embedUrl);
            $("#mediaContainer").css("display", "flex");
            $("#loadYoutubeBtn").text("Load Playlist"); // Change button text to Load Playlist
        } else {
            alert("Please enter a valid YouTube video or playlist URL.");
        }
    });

    // Event listener for the button click to close the media container
    $("#closeMediaContainer").click(function () {
        $("#youtubePlayer").attr("src", "");
        $("#mediaContainer").css("display", "none");
    });
});
