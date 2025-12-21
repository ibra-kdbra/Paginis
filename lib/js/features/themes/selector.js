// Modern Theme Selector - Monkeytype Inspired
// Creates a visionary interactive modal for theme selection

function ThemeSelectorModal() {
    this.modal = null;
    this.themes = [];
    this.filteredThemes = [];
    this.init();
}

ThemeSelectorModal.prototype.init = function() {
    this.createStyles();
    this.createModal();
    this.bindEvents();
};

ThemeSelectorModal.prototype.createStyles = function() {
    if ($('#themeSelectorStyles').length) return;

    const styles = `
        <style id="themeSelectorStyles">
            .tm-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                backdrop-filter: blur(8px);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 2000000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .tm-modal-overlay.active {
                display: flex;
                opacity: 1;
            }

            .tm-modal-content {
                width: 90%;
                max-width: 900px;
                height: 80vh;
                background: #111 !important;
                border-radius: 16px !important;
                display: flex !important;
                flex-direction: column !important;
                overflow: hidden !important;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
                transform: scale(0.9);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
            }

            .tm-modal-overlay.active .tm-modal-content {
                transform: scale(1);
            }

            .tm-modal-header {
                padding: 2rem;
                background: #161616;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .tm-search-container {
                position: relative;
                width: 100%;
            }

            .tm-search-input {
                width: 100%;
                background: #1e1e1e;
                border: 2px solid transparent;
                border-radius: 12px;
                padding: 1rem 1rem 1rem 3rem;
                color: #fff;
                font-size: 1.1rem;
                outline: none;
                transition: all 0.2s ease;
                font-family: 'Inter', sans-serif;
            }

            .tm-search-input:focus {
                border-color: #3b82f6;
                background: #252525;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
            }

            .tm-search-icon {
                position: absolute;
                left: 1.25rem;
                top: 50%;
                transform: translateY(-50%);
                color: #666;
                font-size: 1.2rem;
            }

            .tm-modal-body {
                flex: 1;
                overflow-y: auto;
                padding: 2rem;
                scrollbar-width: thin;
                scrollbar-color: #333 transparent;
            }

            .tm-modal-body::-webkit-scrollbar {
                width: 6px;
            }

            .tm-modal-body::-webkit-scrollbar-thumb {
                background: #333;
                border-radius: 10px;
            }

            .tm-grid {
                display: grid !important;
                grid-template-columns: 1fr 1fr 1fr !important;
                gap: 1.5rem !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }

            @media (max-width: 850px) {
                .tm-grid {
                    grid-template-columns: 1fr 1fr !important;
                }
            }

            @media (max-width: 550px) {
                .tm-grid {
                    grid-template-columns: 1fr !important;
                }
            }

            .tm-card {
                background: #1a1a1a;
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 1.25rem;
                cursor: pointer;
                transition: all 0.25s ease;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                position: relative;
                overflow: hidden;
            }

            .tm-card:hover {
                background: #222;
                border-color: #3b82f6;
                transform: translateY(-4px);
                box-shadow: 0 12px 24px -10px rgba(59, 130, 246, 0.3);
            }

            .tm-card.active {
                border-color: #3b82f6;
                background: #1e2530;
            }

            .tm-card.active::after {
                content: '✓';
                position: absolute;
                top: 0.5rem;
                right: 0.75rem;
                color: #3b82f6;
                font-weight: bold;
            }

            .tm-card-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .tm-card-name {
                font-weight: 600;
                font-size: 0.95rem;
                color: #eee;
                text-transform: capitalize;
            }

            .tm-swatch {
                display: flex;
                gap: 4px;
                background: #000;
                padding: 6px;
                border-radius: 20px;
                width: fit-content;
            }

            .tm-swatch-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }

            .tm-preview-strip {
                display: flex;
                height: 30px;
                border-radius: 6px;
                overflow: hidden;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }

            .tm-preview-part {
                flex: 1;
            }

            .tm-no-results {
                grid-column: 1 / -1;
                text-align: center;
                padding: 3rem;
                color: #666;
                font-size: 1.1rem;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .tm-card {
                animation: fadeIn 0.3s ease forwards;
            }
        </style>
    `;
    $('head').append(styles);
};

ThemeSelectorModal.prototype.createModal = function() {
    const modalHTML = `
        <div id="themeSelectorOverlay" class="tm-modal-overlay">
            <div class="tm-modal-content">
                <div class="tm-modal-header">
                    <div class="tm-search-container">
                        <i class="fas fa-search tm-search-icon"></i>
                        <input type="text" class="tm-search-input" placeholder="Type to search themes..." spellcheck="false">
                    </div>
                </div>
                <div class="tm-modal-body">
                    <div id="themeGrid" class="tm-grid">
                        <!-- Themes populated dynamically -->
                    </div>
                </div>
            </div>
        </div>
    `;
    $('body').append(modalHTML);
    this.modal = $('#themeSelectorOverlay');
};

ThemeSelectorModal.prototype.getThemeColors = function(themeName) {
    // This helper tries to get computed styles for a theme
    // Since themes are applied to body, we create a temporary element to probe
    const temp = $('<div class="theme-' + themeName + '"></div>').hide().appendTo('body');
    
    // We need to wait for CSS to be applied, but since it's already in the DOM, 
    // we can try to read the variables. Note: getComputedStyle might not see vars 
    // unless the element is in a tree where those vars are defined.
    // However, our themes are defined on classes.
    
    // Fallback static colors for popular themes if dynamic probe fails
    const fallbacks = {
        'default': { bg: '#1a1a1a', text: '#e5e7eb', accent: '#3b82f6' },
        'dark': { bg: '#0f0f0f', text: '#f5f5f5', accent: '#3b82f6' },
        'light': { bg: '#ffffff', text: '#1a1a1a', accent: '#3b82f6' },
        'dracula': { bg: '#282a36', text: '#f8f8f2', accent: '#8be9fd' },
        'nord': { bg: '#2e3440', text: '#eceff4', accent: '#88c0d0' },
        'monokai': { bg: '#272822', text: '#f8f8f2', accent: '#f92672' },
        'matrix': { bg: '#0d0d0d', text: '#00ff00', accent: '#00ff00' },
        'cyberpunk': { bg: '#0a0a0a', text: '#ff1493', accent: '#ff1493' }
    };

    // Helper to get variable value
    const getVar = (name) => {
        const val = getComputedStyle(temp[0]).getPropertyValue(name).trim();
        return val || null;
    };

    const colors = {
        bg: getVar('--bg-primary') || fallbacks[themeName]?.bg || '#222',
        text: getVar('--text-primary') || fallbacks[themeName]?.text || '#eee',
        accent: getVar('--text-accent') || fallbacks[themeName]?.accent || '#555'
    };

    temp.remove();
    return colors;
};

ThemeSelectorModal.prototype.renderThemes = function(filter = '') {
    const grid = $('#themeGrid');
    grid.empty();

    const allThemes = window.themeManager?.getAllThemes() || [];
    const currentTheme = window.themeManager?.getCurrentTheme();

    const filtered = allThemes.filter(t => t.toLowerCase().includes(filter.toLowerCase()));

    if (filtered.length === 0) {
        grid.append('<div class="tm-no-results">No themes match your search</div>');
        return;
    }

    filtered.forEach((theme, index) => {
        const colors = this.getThemeColors(theme);
        const displayName = theme.replace(/-/g, ' ');
        const isActive = theme === currentTheme;

        const card = $(`
            <div class="tm-card ${isActive ? 'active' : ''}" data-theme="${theme}" style="animation-delay: ${index * 0.02}s">
                <div class="tm-card-info">
                    <span class="tm-card-name">${displayName}</span>
                    <div class="tm-swatch">
                        <div class="tm-swatch-dot" style="background: ${colors.bg}"></div>
                        <div class="tm-swatch-dot" style="background: ${colors.text}"></div>
                        <div class="tm-swatch-dot" style="background: ${colors.accent}"></div>
                    </div>
                </div>
                <div class="tm-preview-strip">
                    <div class="tm-preview-part" style="background: ${colors.bg}"></div>
                    <div class="tm-preview-part" style="background: ${colors.text}"></div>
                    <div class="tm-preview-part" style="background: ${colors.accent}"></div>
                </div>
            </div>
        `);

        grid.append(card);
    });
};

ThemeSelectorModal.prototype.bindEvents = function() {
    const self = this;

    // Open button
    $(document).on('click', '#openThemeSelectorBtn', function() {
        self.show();
    });

    // Close on overlay click
    this.modal.on('click', function(e) {
        if (e.target === this) self.hide();
    });

    // Search input
    this.modal.find('.tm-search-input').on('input', function() {
        self.renderThemes($(this).val());
    });

    // Theme selection
    $(document).on('click', '.tm-card', function() {
        const theme = $(this).data('theme');
        if (window.themeManager) {
            window.themeManager.setTheme(theme);
            self.hide();
        }
    });

    // Keyboard navigation
    $(document).on('keydown', function(e) {
        if (!self.modal.hasClass('active')) return;

        if (e.key === 'Escape') {
            self.hide();
        }
    });
};

ThemeSelectorModal.prototype.show = function() {
    this.renderThemes(this.modal.find('.tm-search-input').val());
    this.modal.addClass('active').css('display', 'flex');
    setTimeout(() => {
        this.modal.find('.tm-search-input').focus();
    }, 100);
    $('body').css('overflow', 'hidden');
};

ThemeSelectorModal.prototype.hide = function() {
    this.modal.removeClass('active');
    setTimeout(() => {
        if (!this.modal.hasClass('active')) {
            this.modal.css('display', 'none');
        }
    }, 300);
    $('body').css('overflow', '');
};

// Initialize the modal
$(document).ready(function() {
    window.themeSelectorModal = new ThemeSelectorModal();
});
