// Theme Manager
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
        this.applyTheme(this.currentTheme);
    }

    loadSavedTheme() {
        // First try appState (which loads from localStorage)
        if (window.appState && window.appState.get('theme')) {
            this.currentTheme = window.appState.get('theme');
            return;
        }

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
        // Remove existing theme classes from body
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        
        // Root Fix: Only remove theme-specific color classes, not functional UI classes
        // We target only elements that have theme-applied class or common components
        $('*').removeClass(function(index, className) {
            // Only match the specific theme names to avoid stripping 'theme-grid', 'theme-card' etc.
            const themeClassNames = window.themeManager?.themes || [];
            const matches = className.match(/theme-\w+/g) || [];
            return matches.filter(c => themeClassNames.includes(c.replace('theme-', ''))).join(' ');
        });

        // Add new theme class to body and all elements
        document.body.classList.add(`theme-${themeName}`, 'theme-applied');

        // Apply to common UI elements that might not get styles through global selector
        $('#unifiedPanel').addClass(`theme-${themeName}`, 'theme-applied');
        $('#pdfSpecificQuotesModal').addClass(`theme-${themeName}`, 'theme-applied');
        $('.panel-section, .panel-button, .panel-input, .quote-item, .modal-content').addClass(`theme-${themeName}`, 'theme-applied');
        $('button, input, select, textarea').addClass(`theme-${themeName}`, 'theme-applied');

        // Update theme selection button text
        const themeBtn = $('#openThemeSelectorBtn');
        if (themeBtn.length) {
            themeBtn.find('span').text(`Theme: ${this.formatThemeName(themeName)}`);
        }

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
