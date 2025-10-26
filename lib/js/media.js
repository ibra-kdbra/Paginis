$(document).ready(function () {
    // Load YouTube video or playlist on button click
    $("#loadYoutubeBtn").click(function () {
        const youtubeUrl = $("#youtubeUrl").val();
        const videoId = youtubeUrl.split("v=")[1]?.split("&")[0];
        const playlistId = youtubeUrl.split("list=")[1]?.split("&")[0];

        if (videoId) {
            // If the URL is a video URL, set the iframe src for the video
            $("#youtubePlayer").attr("src", `https://www.youtube.com/embed/${videoId}`);
            $(this).html('<i class="fab fa-youtube"></i>').attr("title", "Load YouTube Video");
            showMediaPlayer();
        } else if (playlistId) {
            // If the URL is a playlist URL, set the iframe src for the playlist
            $("#youtubePlayer").attr("src", `https://www.youtube.com/embed/videoseries?list=${playlistId}`);
            $(this).html('<i class="fab fa-youtube"></i>').attr("title", "Load YouTube Playlist");
            showMediaPlayer();
        } else {
            // Show alert if the URL is invalid
            alert("Please enter a valid YouTube video or playlist URL.");
        }
    });

    function showMediaPlayer() {
        // Show the media player in the unified panel
        $("#mediaPlayer").show();
        // Scroll to media section if needed
        document.querySelector('.panel-section:last-child').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    function hideMediaPlayer() {
        // Hide the media player in the unified panel
        $("#youtubePlayer").attr("src", "");
        $("#mediaPlayer").hide();
    }

    $("#closeMediaContainer").click(function () {
        hideMediaPlayer();
    });

    // Volume control functionality
    $("#volumeSlider").on("input", function() {
        const volume = $(this).val();
        // Note: YouTube iframe doesn't allow direct volume control via JavaScript
        // due to browser security policies. This is a UI element for future enhancement.
        console.log("Volume set to:", volume);
    });

    // Initialize media player as hidden
    $("#mediaPlayer").hide();
});
