// Main entry point
// Dynamically loads all scripts in the correct dependency order

// Script loading utility
function loadScript(src, isModule = false, integrity = null) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        // Add cache-busting parameter
        const separator = src.includes('?') ? '&' : '?';
        script.src = `${src}${separator}t=${Date.now()}`;
        script.async = false; // Load synchronously to maintain order

        if (isModule) {
            script.type = 'module';
        }

        if (integrity) {
            script.integrity = integrity;
            script.crossOrigin = 'anonymous';
        }

        script.onload = () => resolve(src);
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

        document.head.appendChild(script);
    });
}

// Load scripts in dependency order
async function loadApplication() {
    try {
        // 1. External dependencies
        await loadScript('lib/js/libs/jquery.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/toastify-js');

        // 2. Core libraries
        await loadScript('lib/js/libs/three.min.js');
        await loadScript('lib/js/libs/pdf.min.js');
        await loadScript('lib/js/libs/pdf.worker.min.js');
        await loadScript('lib/js/libs/mockup.min.js');

        // 3. Utilities (set up global objects)
        await loadScript('lib/js/utils/theme-utils.js');
        await loadScript('lib/js/utils/validation.js');
        await loadScript('lib/js/utils/browser-compatibility.js');
        await loadScript('lib/js/utils/mobile-support.js');
        await loadScript('lib/js/utils/memory-manager.js');
        await loadScript('lib/js/utils/performance-monitor.js');
        await loadScript('lib/js/utils/service-worker.js');

        // 4. Application state & data
        await loadScript('lib/js/utils/app-state.js');
        await loadScript('lib/js/utils/pageMemory.js');

        // 5. Core PDF functionality
        await loadScript('lib/js/core/flipbook.js');
        await loadScript('lib/js/core/load.js');

        // 6. User interface
        await loadScript('lib/js/ui/controls.js');

        // 7. Feature modules (ES6 modules)
        await loadScript('lib/js/features/media/media.js');
        await loadScript('lib/js/features/themes/manager.js', true);
        await loadScript('lib/js/features/themes/selector.js', true);
        await loadScript('lib/js/features/changelog/changelog.js', true);

        // Load quotes modules last to ensure proper import resolution
        await loadScript('lib/js/features/quotes/db.js', true);
        await loadScript('lib/js/features/quotes/main.js', true);

        // Initialize the application
        initializeApp();

    } catch (error) {
        console.error('Failed to load application:', error);
        // Fallback: show error message
        document.body.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                color: red;
                font-family: Arial, sans-serif;
            ">
                <h2>Failed to load application</h2>
                <p>${error.message}</p>
                <p>Please refresh the page to try again.</p>
            </div>
        `;
    }
}

// Initialize app after all scripts are loaded
function initializeApp() {
    // The initialization is handled by the individual scripts
    // This function can be used for any final setup if needed
    console.log(' Paginis application initialized');
}

// Start loading the application
loadApplication();
