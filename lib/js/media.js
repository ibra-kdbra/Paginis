// YouTube IFrame API variables
let youtubePlayer;
let isMediaPlaying = false;

// Load YouTube IFrame API
function loadYouTubeAPI() {
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
}

// Initialize YouTube API when ready
window.onYouTubeIframeAPIReady = function() {
    // YouTube API is ready, player will be created when needed
    console.log('YouTube API ready');
};

$(document).ready(function () {
    // Load YouTube API
    loadYouTubeAPI();

    // Load YouTube video or playlist on button click
    $("#loadYoutubeBtn").click(function () {
        const youtubeUrl = $("#youtubeUrl").val();
        const videoId = youtubeUrl.split("v=")[1]?.split("&")[0];
        const playlistId = youtubeUrl.split("list=")[1]?.split("&")[0];

        if (videoId) {
            // If the URL is a video URL, set the iframe src for the video
            $("#youtubePlayer").attr("src", `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`);
            $(this).html('<i class="fab fa-youtube"></i>').attr("title", "Load YouTube Video");
            initializePlayer();
            showMediaPlayer();
        } else if (playlistId) {
            // If the URL is a playlist URL, set the iframe src for the playlist
            $("#youtubePlayer").attr("src", `https://www.youtube.com/embed/videoseries?list=${playlistId}&enablejsapi=1&origin=${window.location.origin}`);
            $(this).html('<i class="fab fa-youtube"></i>').attr("title", "Load YouTube Playlist");
            initializePlayer();
            showMediaPlayer();
        } else {
            // Show alert if the URL is invalid
            alert("Please enter a valid YouTube video or playlist URL.");
        }
    });

    function initializePlayer() {
        // Wait for iframe to load, then create player instance
        setTimeout(() => {
            if (window.YT && window.YT.Player) {
                youtubePlayer = new YT.Player('youtubePlayer', {
                    events: {
                        'onStateChange': onPlayerStateChange,
                        'onReady': onPlayerReady
                    }
                });
            }
        }, 1000);
    }

    function onPlayerReady(event) {
        // Player is ready, set initial volume
        if (youtubePlayer) {
            const savedVolume = localStorage.getItem('youtubeVolume') || 50;
            youtubePlayer.setVolume(savedVolume);
            $("#volumeSlider").val(savedVolume);
        }
    }

    function onPlayerStateChange(event) {
        // Update media playing state
        isMediaPlaying = event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.PAUSED;

        // Show/hide controls based on media state
        updateMediaControls();
    }

    function updateMediaControls() {
        const closeBtn = $("#closeMediaContainer");
        const volumeControl = $(".volume-control");

        if (isMediaPlaying) {
            closeBtn.show();
            volumeControl.show();
        } else {
            closeBtn.hide();
            volumeControl.hide();
        }
    }

    function showMediaPlayer() {
        // Show the media player in the unified panel
        $("#mediaPlayer").show();
        isMediaPlaying = true;
        updateMediaControls();

        // Scroll to media section if needed
        document.querySelector('.panel-section:last-child').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    function hideMediaPlayer() {
        // Hide the media player in the unified panel
        if (youtubePlayer) {
            youtubePlayer.destroy();
            youtubePlayer = null;
        }
        $("#youtubePlayer").attr("src", "");
        $("#mediaPlayer").hide();
        isMediaPlaying = false;
        updateMediaControls();
    }

    $("#closeMediaContainer").click(function () {
        hideMediaPlayer();
    });

    // Enhanced volume control with YouTube API
    $("#volumeSlider").on("input", function() {
        const volume = $(this).val();

        if (youtubePlayer && youtubePlayer.setVolume) {
            youtubePlayer.setVolume(volume);
            localStorage.setItem('youtubeVolume', volume);
        }
    });

    // Initialize media player as hidden
    $("#mediaPlayer").hide();
    updateMediaControls();
});
