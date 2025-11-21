// Theme Manager for PDF Flipbook
class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.themes = [
            'default', 'dark', 'light', 'purple', 'green', 'red', 'orange', 'pink',
            'cyan', 'indigo', 'yellow', 'gray', 'emerald', 'teal', 'violet', 'rose',
            'amber', 'lime', 'sky', 'fuchsia', 'slate', 'zinc', 'neutral', 'stone',
            'dracula', 'nord', 'gruvbox', 'solarized', 'monokai', 'tomorrow',
            'github', 'material', 'vscode', 'atom', 'xcode', 'sublime', 'jetbrains',
            'notepad', 'terminal', 'matrix', 'cyberpunk', 'ocean', 'forest', 'sunset',
            'midnight', 'cherry', 'lavender', 'mint', 'coffee', 'neon', 'gold',
            'silver', 'bronze', 'platinum'
        ];
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.createThemeSelector();
        this.applyTheme(this.currentTheme);
    }

    loadSavedTheme() {
        if (window.dbInitialized) {
            import('../../quotes/db.js').then(({ getSettings }) => {
                getSettings((settings) => {
                    if (settings && settings.theme) {
                        this.currentTheme = settings.theme;
                        this.applyTheme(this.currentTheme);
                    }
                });
            }).catch(() => {
                // Fallback if database not available
            });
        }
    }

    createThemeSelector() {
        // Bind dropdown change event
        const themeSelect = $('#themeSelect');
        if (themeSelect.length) {
            themeSelect.on('change', (e) => {
                const selectedTheme = e.target.value;
                if (selectedTheme && this.themes.includes(selectedTheme)) {
                    this.setTheme(selectedTheme);
                }
            });

            // Set initial value from current theme
            themeSelect.val(this.currentTheme);
        }
    }

    formatThemeName(theme) {
        return theme.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    setTheme(themeName) {
        if (this.themes.includes(themeName)) {
            this.currentTheme = themeName;
            this.applyTheme(themeName);
            this.saveTheme(themeName);

            // Show success feedback
            if (window.Toastify) {
                window.Toastify({
                    text: `Theme changed to ${this.formatThemeName(themeName)}`,
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    backgroundColor: "#22c55e"
                }).showToast();
            }
        }
    }

    applyTheme(themeName) {
        // Remove existing theme classes
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        $('*').removeClass(function(index, className) {
            return (className.match(/theme-\w+/g) || []).join(' ');
        });

        // Add new theme class to body and all elements
        document.body.classList.add(`theme-${themeName}`, 'theme-applied');

        // Apply to common UI elements that might not get styles through global selector
        $('#unifiedPanel').addClass(`theme-${themeName}`, 'theme-applied');
        $('#pdfSpecificQuotesModal').addClass(`theme-${themeName}`, 'theme-applied');
        $('.panel-section, .panel-button, .panel-input, .quote-item, .modal-content').addClass(`theme-${themeName}`, 'theme-applied');
        $('button, input, select, textarea').addClass(`theme-${themeName}`, 'theme-applied');

        // Update dropdown value
        $('#themeSelect').val(themeName);

        // Trigger custom event for theme change
        $(document).trigger('themeChanged', [themeName]);
    }

    saveTheme(themeName) {
        // Save to app state first (real-time update)
        if (window.appState) {
            window.appState.setTheme(themeName);
        }

        // Also save to database for persistence
        if (window.dbInitialized) {
            import('../../quotes/db.js').then(({ getSettings, updateSettings }) => {
                getSettings((settings) => {
                    const updatedSettings = { ...settings, theme: themeName };
                    updateSettings(updatedSettings, () => {
                        // console.log('Theme saved to database:', themeName);
                    });
                });
            }).catch(() => {
                // Silently fail if database not available
            });
        }
    }

    getAllThemes() {
        return this.themes;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager when DOM is ready
$(document).ready(function() {
    window.themeManager = new ThemeManager();
});
