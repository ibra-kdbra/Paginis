// YouTube player variable
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
    console.log('YouTube API ready for Paginis');
};

// Extract video ID from YouTube URL
function extractYouTubeVideoId(url) {
    if (!url) return null;

    // Handle different YouTube URL formats
    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
        /youtube\.com\/embed\/([^"&?\/\s]{11})/i,
        /youtube\.com\/v\/([^"&?\/\s]{11})/i
    ];

    for (let i = 0; i < patterns.length; i++) {
        const match = url.match(patterns[i]);
        if (match && match[1]) {
            const videoId = match[1];
            return videoId;
        }
    }

    // Try direct v= parameter extraction for URL
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        if (videoId && videoId.length === 11) {
            return videoId;
        }
    } catch (e) {
        // URL parsing failed
    }

    return null;
}

// Extract playlist ID from YouTube URL
function extractYouTubePlaylistId(url) {
    if (!url) return null;

    try {
        const urlObj = new URL(url);
        const listId = urlObj.searchParams.get('list');
        return listId;
    } catch (e) {
        return null;
    }
}

$(document).ready(function () {
    // Load YouTube API
    loadYouTubeAPI();

    // Handle keyboard shortcut for loading URL (Ctrl+V or Cmd+V like)
    $(document).on('keydown', '#youtubeUrl', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            $("#loadYoutubeBtn").click();
        }
    });

    // Load YouTube video button
    $("#loadYoutubeBtn").click(function () {
        const youtubeUrl = $("#youtubeUrl").val().trim();

        if (!youtubeUrl) {
            alert("Please paste a YouTube URL in the input field.");
            return;
        }

        const videoId = extractYouTubeVideoId(youtubeUrl);
        const playlistId = extractYouTubePlaylistId(youtubeUrl);

        if (!videoId && !playlistId) {
            alert("Invalid YouTube URL. Please check the URL and try again.");
            return;
        }

        // Construct the embed URL
        let embedUrl;
        if (playlistId && videoId) {
            // Video in playlist
            embedUrl = `https://www.youtube.com/embed/${videoId}?list=${playlistId}&autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
        } else if (playlistId) {
            // Playlist only
            embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
        } else {
            // Single video
            embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
        }



        // Destroy existing player
        if (youtubePlayer) {
            youtubePlayer.destroy();
            youtubePlayer = null;
        }

        // Set the iframe source directly (this will auto-play)
        $("#youtubePlayer").attr("src", embedUrl);

        // Initialize player for volume control after a delay
        setTimeout(() => {
            initializeYouTubePlayer();
        }, 1500);

        // Show the player
        $(".media-player-container").show();
        isMediaPlaying = true;
        updateMediaControls();

        // Show success notification
        Toastify({
            text: "YouTube video loaded and playing!",
            duration: 2000,
            gravity: "bottom",
            position: "right"
        }).showToast();
    });

    // Load YouTube playlist button
    $("#loadPlaylistBtn").click(function () {
        const youtubeUrl = $("#youtubeUrl").val().trim();

        if (!youtubeUrl) {
            alert("Please paste a YouTube playlist URL in the input field.");
            return;
        }

        const playlistId = extractYouTubePlaylistId(youtubeUrl);
        if (!playlistId) {
            alert("No playlist found in this URL. Try pasting a playlist URL.");
            return;
        }

        // Override with playlist embed
        const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;

        if (youtubePlayer) {
            youtubePlayer.destroy();
            youtubePlayer = null;
        }

        $("#youtubePlayer").attr("src", embedUrl);

        setTimeout(() => {
            initializeYouTubePlayer();
        }, 1500);

        $(".media-player-container").show();
        isMediaPlaying = true;
        updateMediaControls();

        Toastify({
            text: "Playlist loaded and playing!",
            duration: 2000,
            gravity: "bottom",
            position: "right"
        }).showToast();
    });

    // Initialize YouTube player for volume control
    function initializeYouTubePlayer() {
        setTimeout(() => {
            if (window.YT && window.YT.Player) {
                youtubePlayer = new YT.Player('youtubePlayer', {
                    events: {
                        'onStateChange': onYouTubePlayerStateChange,
                        'onReady': onYouTubePlayerReady
                    }
                });
            }
        }, 1000);
    }

    function onYouTubePlayerReady(event) {
        const savedVolume = localStorage.getItem('mediaVolume') || 50;
        if (youtubePlayer && youtubePlayer.setVolume) {
            youtubePlayer.setVolume(savedVolume);
        }
        $("#volumeSlider").val(savedVolume);
    }

    function onYouTubePlayerStateChange(event) {
        isMediaPlaying = event.data === YT.PlayerState.PLAYING || event.data === YT.PlayerState.PAUSED;
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

    $("#closeMediaContainer").click(hideMediaPlayer);

    $("#volumeSlider").on("input", function() {
        const volume = $(this).val();
        localStorage.setItem('mediaVolume', volume);

        if (youtubePlayer && youtubePlayer.setVolume) {
            youtubePlayer.setVolume(volume);
        }
    });

    function hideMediaPlayer() {
        if (youtubePlayer) {
            youtubePlayer.destroy();
            youtubePlayer = null;
        }
        $("#youtubePlayer").attr("src", "");
        $(".media-player-container").hide();
        isMediaPlaying = false;
        updateMediaControls();
    }

    // Initialize with saved volume
    const initialVolume = localStorage.getItem('mediaVolume') || 50;
    $("#volumeSlider").val(initialVolume);

    // Start hidden
    $(".media-player-container").hide();
    updateMediaControls();

    // Auto-focus on input field for easy URL pasting
    $("#youtubeUrl").focus();
});
