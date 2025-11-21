// Modern Theme Selector
// Creates an interactive modal for theme selection with categories and previews

// Theme Selector Modal Handler
function ThemeSelectorModal() {
    this.init();
}

ThemeSelectorModal.prototype.init = function() {
    this.createThemeSelectorModal();
    this.bindEvents();
    this.updateCurrentThemeDisplay();
};

ThemeSelectorModal.prototype.createThemeSelectorModal = function() {
    const getCategorizedThemes = window.ThemeUtils?.getCategorizedThemes;
    const categories = getCategorizedThemes ? getCategorizedThemes() : {
        Core: ['default', 'dark', 'light'],
        Colors: ['purple', 'green', 'red', 'orange', 'pink', 'cyan']
    };

    // Simple modal HTML
    const modalHTML = `
        <div id="themeSelectorModal" class="modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div class="theme-modal" style="
                background: #1f2937;
                border: 2px solid #374151;
                border-radius: 12px;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                color: white;
            ">
                <div class="theme-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #374151;
                ">
                    <h3 style="margin: 0; font-size: 1.25rem;">🎨 Choose Theme</h3>
                    <button id="closeThemeSelectorBtn" style="
                        background: none;
                        border: none;
                        color: #9ca3af;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 0.5rem;
                    ">✕</button>
                </div>
                <div class="theme-body" style="padding: 1.5rem;">
                    <div id="themeTabs" class="theme-tabs" style="
                        display: flex;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                    "></div>
                    <div id="themeGrids" class="theme-grids"></div>
                </div>
            </div>
        </div>
    `;

    // Inline styles for theme options
    const styleHTML = `
        <style>
            .theme-tab-button {
                padding: 0.5rem 1rem;
                border: 1px solid #374151;
                background: #374151;
                color: #d1d5db;
                border-radius: 6px;
                cursor: pointer;
            }
            .theme-tab-button.active {
                background: #3b82f6;
                border-color: #3b82f6;
                color: white;
            }
            .theme-grid {
                display: none;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 0.5rem;
            }
            .theme-grid.active { display: grid; }
            .theme-option {
                background: #374151;
                border: 2px solid transparent;
                border-radius: 8px;
                padding: 0.75rem;
                cursor: pointer;
                text-align: center;
                transition: all 0.2s ease;
            }
            .theme-option:hover {
                border-color: #9ca3af;
                background: #4b5563;
            }
            .theme-option.selected {
                border-color: #3b82f6;
                background: #2563eb;
            }
            .theme-preview {
                width: 100%;
                height: 40px;
                border-radius: 4px;
                margin-bottom: 0.5rem;
            }
            .theme-name {
                font-size: 0.75rem;
                margin: 0;
                font-weight: 500;
            }
        </style>
    `;

    $('body').append(modalHTML);

    // Populate categories and themes
    this.populateCategories(categories);
};

ThemeSelectorModal.prototype.populateCategories = function(categories) {
    const tabsContainer = $('#themeTabs');
    const gridsContainer = $('#themeGrids');

    Object.keys(categories).forEach((categoryName, index) => {
        // Create tab button
        const tabBtn = $(`
            <button class="theme-tab-button" data-category="${categoryName}">
                ${categoryName}
            </button>
        `);
        tabsContainer.append(tabBtn);

        // Create theme grid
        const themeGrid = $(`<div class="theme-grid" data-category="${categoryName}"></div>`);
        gridsContainer.append(themeGrid);

        // Populate theme options
        categories[categoryName].forEach(themeName => {
            const themeOption = this.createThemeOption(themeName);
            themeGrid.append(themeOption);
        });

        // Set first tab as active
        if (index === 0) {
            tabBtn.addClass('active');
            themeGrid.addClass('active');
        }
    });
};

ThemeSelectorModal.prototype.createThemeOption = function(themeName) {
    const { getCurrentTheme, getThemeDisplayName } = window.ThemeUtils || {};
    const currentTheme = getCurrentTheme ? getCurrentTheme() : 'default';
    const displayName = getThemeDisplayName ? getThemeDisplayName(themeName) : themeName;

    const themeOption = $(`
        <div class="theme-option" data-theme="${themeName}">
            <div class="theme-preview" style="background: linear-gradient(45deg, #${this.getColor(themeName)}, #${this.getColor(themeName, true)});"></div>
            <div class="theme-name">${displayName}</div>
        </div>
    `);

    if (themeName === currentTheme) {
        themeOption.addClass('selected');
    }

    return themeOption;
};

ThemeSelectorModal.prototype.getColor = function(themeName, alt) {
    const colors = {
        'default': alt ? '3b82f6' : '1f2937',
        'dark': alt ? '0f0f0f' : '1f2937',
        'light': alt ? 'ffffff' : 'f3f4f6',
        'purple': alt ? '8b5cf6' : '581c87',
        'green': alt ? '10b981' : '065f46',
        'red': alt ? 'ef4444' : 'dc2626',
        'orange': alt ? 'f97316' : 'ea580c',
        'pink': alt ? 'ec4899' : 'db2777',
        'cyan': alt ? '06b6d4' : '0891b2'
    };
    return colors[themeName] || '6b7280';
};

ThemeSelectorModal.prototype.bindEvents = function() {
    // Open theme selector
    $('#openThemeSelectorBtn').on('click', () => this.show());

    // Close theme selector
    $('#closeThemeSelectorBtn, #themeSelectorModal').on('click', (e) => {
        if (e.target.id === 'themeSelectorModal' || e.target.id === 'closeThemeSelectorBtn') {
            this.hide();
        }
    });

    // Prevent modal content from closing modal
    $('#themeSelectorModal .theme-modal').on('click', (e) => {
        e.stopPropagation();
    });

    // Tab switching
    $(document).on('click', '.theme-tab-button', (e) => {
        const category = $(e.target).data('category');
        this.switchCategory(category);
    });

    // Theme selection
    $(document).on('click', '.theme-option', (e) => {
        const theme = $(e.target).closest('.theme-option').data('theme');
        if (theme && window.themeManager) {
            window.themeManager.setTheme(theme);
            this.updateThemeSelections(theme);
            this.updateCurrentThemeDisplay();
            this.hide();

            // Show success feedback
            if (window.Toastify) {
                window.Toastify({
                    text: `Theme changed to ${window.ThemeUtils?.getThemeDisplayName ? window.ThemeUtils.getThemeDisplayName(theme) : theme}`,
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#22c55e"
                }).showToast();
            }
        }
    });

    // Keyboard navigation
    $(document).on('keydown', (e) => {
        if (!$('#themeSelectorModal').is(':visible')) return;

        if (e.key === 'Escape') {
            this.hide();
        }
    });
};

ThemeSelectorModal.prototype.show = function() {
    $('#themeSelectorModal').show();
};

ThemeSelectorModal.prototype.hide = function() {
    $('#themeSelectorModal').hide();
};

ThemeSelectorModal.prototype.switchCategory = function(categoryName) {
    // Update tab buttons
    $('.theme-tab-button').removeClass('active');
    $(`.theme-tab-button[data-category="${categoryName}"]`).addClass('active');

    // Update grids
    $('.theme-grid').removeClass('active');
    $(`.theme-grid[data-category="${categoryName}"]`).addClass('active');
};

ThemeSelectorModal.prototype.updateThemeSelections = function(selectedTheme) {
    $('.theme-option').removeClass('selected');
    $(`.theme-option[data-theme="${selectedTheme}"]`).addClass('selected');
};

ThemeSelectorModal.prototype.updateCurrentThemeDisplay = function() {
    if (!window.ThemeUtils) return;

    const { getCurrentTheme, getThemeDisplayName } = window.ThemeUtils;
    const currentTheme = getCurrentTheme ? getCurrentTheme() : 'Loading...';
    const displayName = getThemeDisplayName ? getThemeDisplayName(currentTheme) : currentTheme;

    $('#currentThemeName').text(displayName);
    const color = this.getColor(currentTheme);
    $('#currentThemeColor').css('background-color', `#${color}`);
};

// Initialize when DOM ready
$(document).ready(function() {
    // Wait for theme utils to be available, then initialize
    const initSelector = function() {
        if (window.ThemeUtils && window.themeManager) {
            new ThemeSelectorModal();
        } else {
            setTimeout(initSelector, 100);
        }
    };

    initSelector();
});
