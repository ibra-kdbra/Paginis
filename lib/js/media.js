$(document).ready(function () {
    // Load YouTube video or playlist on button click
    $("#loadYoutubeBtn").click(function () {
        const youtubeUrl = $("#youtubeUrl").val();
        const videoId = youtubeUrl.split("v=")[1]?.split("&")[0];
        const playlistId = youtubeUrl.split("list=")[1]?.split("&")[0];

        if (videoId) {
            // If the URL is a video URL, set the iframe src for the video
            $("#youtubePlayer").attr("src", `https://www.youtube.com/embed/${videoId}`);
            $("#mediaContainer").css("display", "flex");
            $(this).html('<i class="fab fa-youtube"></i>').attr("title", "Load YouTube Video");
        } else if (playlistId) {
            // If the URL is a playlist URL, set the iframe src for the playlist
            $("#youtubePlayer").attr("src", `https://www.youtube.com/embed/videoseries?list=${playlistId}`);
            $("#mediaContainer").css("display", "flex");
            $(this).html('<i class="fab fa-youtube"></i>').attr("title", "Load YouTube Playlist");
        } else {
            // Show alert if the URL is invalid
            alert("Please enter a valid YouTube video or playlist URL.");
        }
    });

    $("#closeMediaContainer").click(function () {
        $("#youtubePlayer").attr("src", "");
        $("#mediaContainer").css("display", "none");
    });
});
