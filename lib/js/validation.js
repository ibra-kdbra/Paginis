// Input validation utilities
// Provides secure validation for URLs, files, and user inputs

/**
 * Validates if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL
 */
function isValidUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }

    try {
        const urlObj = new URL(url);
        // Check for valid protocols
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch (e) {
        return false;
    }
}

/**
 * Validates if a URL points to a PDF file
 * @param {string} url - The URL to check
 * @returns {boolean} - True if likely a PDF URL
 */
function isValidPdfUrl(url) {
    if (!isValidUrl(url)) {
        return false;
    }

    // Check file extension or common PDF patterns
    const pdfPatterns = [
        /\.pdf(\?.*)?$/i,  // .pdf extension
        /\/pdf\//i,        // Common PDF directory
        /document/i,       // Generic document patterns
        /file/i
    ];

    return pdfPatterns.some(pattern => pattern.test(url));
}

/**
 * Validates file input for PDF uploads
 * @param {File} file - The file object to validate
 * @returns {Object} - Validation result with isValid boolean and error message
 */
function validatePdfFile(file) {
    const result = {
        isValid: false,
        error: null
    };

    if (!file) {
        result.error = "No file selected.";
        return result;
    }

    // Check file type
    const allowedTypes = [
        'application/pdf',
        'application/x-pdf'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
        result.error = "Please select a valid PDF file.";
        return result;
    }

    // Check file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
        result.error = "File size must be less than 50MB.";
        return result;
    }

    // Check minimum size (not empty)
    if (file.size === 0) {
        result.error = "File appears to be empty.";
        return result;
    }

    result.isValid = true;
    return result;
}

/**
 * Sanitizes user input by trimming and basic cleaning
 * @param {string} input - The input to sanitize
 * @returns {string} - Sanitized input
 */
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input.trim().replace(/[<>]/g, ''); // Basic XSS prevention
}

/**
 * Validates YouTube URL with enhanced patterns
 * @param {string} url - The YouTube URL to validate
 * @returns {Object} - Validation result with isValid, videoId, playlistId
 */
function validateYouTubeUrl(url) {
    const result = {
        isValid: false,
        videoId: null,
        playlistId: null,
        error: null
    };

    if (!url || typeof url !== 'string') {
        result.error = "Invalid URL provided.";
        return result;
    }

    try {
        const urlObj = new URL(url);

        // Must be youtube.com or youtu.be
        if (!urlObj.hostname.includes('youtube.com') && !urlObj.hostname.includes('youtu.be')) {
            result.error = "Not a valid YouTube URL.";
            return result;
        }

        // Enhanced video ID extraction
        const videoPatterns = [
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
            /youtube\.com\/embed\/([^"&?\/\s]{11})/i,
            /youtube\.com\/v\/([^"&?\/\s]{11})/i
        ];

        for (let pattern of videoPatterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                result.videoId = match[1];
                break;
            }
        }

        // Playlist ID extraction
        const playlistMatch = url.match(/[?&]list=([^"&?\/\s]+)/i);
        if (playlistMatch) {
            result.playlistId = playlistMatch[1];
        }

        // Direct v= parameter fallback
        if (!result.videoId) {
            const vParam = urlObj.searchParams.get('v');
            if (vParam && vParam.length === 11) {
                result.videoId = vParam;
            }
        }

        if (result.videoId || result.playlistId) {
            result.isValid = true;
        } else {
            result.error = "Could not extract video or playlist ID from URL.";
        }

    } catch (e) {
        result.error = "Invalid URL format.";
    }

    return result;
}

/**
 * Checks if the current browser supports required features
 * @returns {Object} - Support status for each feature
 */
function checkBrowserSupport() {
    return {
        webgl: (() => {
            try {
                const canvas = document.createElement('canvas');
                return !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
            } catch (e) {
                return false;
            }
        })(),
        fileApi: !!(window.File && window.FileReader && window.FileList && window.Blob),
        indexeddb: !!(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB),
        localstorage: (() => {
            try {
                const test = '__storage_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
                return true;
            } catch (e) {
                return false;
            }
        })()
    };
}

// Export functions for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidUrl,
        isValidPdfUrl,
        validatePdfFile,
        sanitizeInput,
        validateYouTubeUrl,
        checkBrowserSupport
    };
}

// Make available globally for non-module scripts
window.ValidationUtils = {
    isValidUrl,
    isValidPdfUrl,
    validatePdfFile,
    sanitizeInput,
    validateYouTubeUrl,
    checkBrowserSupport
};
