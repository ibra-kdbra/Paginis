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
        // Load saved theme from settings
        this.loadSavedTheme();

        // Create theme selector UI
        this.createThemeSelector();

        // Apply current theme
        this.applyTheme(this.currentTheme);
    }

    loadSavedTheme() {
        // This will be called after database initialization
        if (window.dbInitialized) {
            import('../quotes/db.js').then(({ getSettings }) => {
                getSettings((settings) => {
                    if (settings && settings.theme) {
                        this.currentTheme = settings.theme;
                        this.applyTheme(this.currentTheme);
                    }
                });
            });
        }
    }

    createThemeSelector() {
        // Find the PDF Options section
        const pdfOptionsSection = document.querySelector('.panel-section:nth-child(2)');
        if (pdfOptionsSection) {
            const themeSelector = document.createElement('div');
            themeSelector.className = 'theme-selector';
            themeSelector.innerHTML = `
                <div class="tool-group">
                    <label class="tool-label">Theme</label>
                    <select id="themeSelect" class="panel-select theme-dropdown">
                        ${this.themes.map(theme => `
                            <option value="${theme}" ${theme === this.currentTheme ? 'selected' : ''}>
                                ${this.formatThemeName(theme)}
                            </option>
                        `).join('')}
                    </select>
                </div>
            `;

            // Insert at the end of the PDF options section
            pdfOptionsSection.appendChild(themeSelector);

            // Add event listener
            document.getElementById('themeSelect').addEventListener('change', (e) => {
                this.setTheme(e.target.value);
            });

            // Initially hide the theme selector
            themeSelector.style.display = 'none';

            // Ensure theme is applied to the selector itself
            themeSelector.classList.add(`theme-${this.currentTheme}`, 'theme-applied');
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
        }
    }

    applyTheme(themeName) {
        console.log('Applying theme:', themeName);

        // Remove all existing theme classes from body and all elements
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        $('*').removeClass(function(index, className) {
            return (className.match(/theme-\w+/g) || []).join(' ');
        });

        // Add new theme class to body and all elements
        document.body.classList.add(`theme-${themeName}`, 'theme-applied');
        $('*').addClass(`theme-${themeName}`, 'theme-applied');

        // Update CSS custom properties with the theme colors
        const themeColors = this.getThemeColors(themeName);
        this.updateCSSVariables(themeColors);

        // Ensure modal elements also get the theme applied
        $('#pdfSpecificQuotesModal').addClass(`theme-${themeName}`, 'theme-applied');
        $('.modal-content, .modal-header, .modal-body, .modal-quote-list, .modal-quote-item, .modal-quote-actions').addClass(`theme-${themeName}`, 'theme-applied');

        // Update theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = themeName;
        }

        console.log('Theme applied successfully to all elements:', themeName);
    }

    getThemeColors(themeName) {
        // Return the CSS variables for the theme
        const themes = {
            'default': {
                'bg-primary': '#1a1a1a',
                'bg-secondary': 'rgba(26, 26, 26, 0.95)',
                'bg-tertiary': 'rgba(45, 55, 72, 0.5)',
                'bg-accent': 'rgba(59, 130, 246, 0.1)',
                'bg-accent-hover': 'rgba(59, 130, 246, 0.2)',
                'bg-accent-active': 'rgba(59, 130, 246, 0.3)',
                'border-primary': 'rgba(107, 114, 128, 0.3)',
                'border-secondary': 'rgba(107, 114, 128, 0.2)',
                'border-accent': 'rgba(59, 130, 246, 0.3)',
                'text-primary': '#e5e7eb',
                'text-secondary': '#9ca3af',
                'text-accent': '#3b82f6',
                'text-success': '#22c55e',
                'text-warning': '#f59e0b',
                'text-error': '#ef4444',
                'shadow-primary': '0 8px 32px rgba(0, 0, 0, 0.4)',
                'shadow-accent': '0 8px 25px rgba(59, 130, 246, 0.3)',
                'shadow-success': '0 8px 25px rgba(34, 197, 94, 0.3)',
                'shadow-error': '0 8px 25px rgba(239, 68, 68, 0.3)'
            },
            'dark': {
                'bg-primary': '#0f0f0f',
                'bg-secondary': 'rgba(15, 15, 15, 0.95)',
                'bg-tertiary': 'rgba(30, 30, 30, 0.5)',
                'bg-accent': 'rgba(59, 130, 246, 0.1)',
                'bg-accent-hover': 'rgba(59, 130, 246, 0.2)',
                'bg-accent-active': 'rgba(59, 130, 246, 0.3)',
                'border-primary': 'rgba(80, 80, 80, 0.3)',
                'border-secondary': 'rgba(80, 80, 80, 0.2)',
                'border-accent': 'rgba(59, 130, 246, 0.3)',
                'text-primary': '#f5f5f5',
                'text-secondary': '#b0b0b0',
                'text-accent': '#3b82f6',
                'text-success': '#22c55e',
                'text-warning': '#f59e0b',
                'text-error': '#ef4444',
                'shadow-primary': '0 8px 32px rgba(0, 0, 0, 0.6)',
                'shadow-accent': '0 8px 25px rgba(59, 130, 246, 0.3)',
                'shadow-success': '0 8px 25px rgba(34, 197, 94, 0.3)',
                'shadow-error': '0 8px 25px rgba(239, 68, 68, 0.3)'
            },
            'light': {
                'bg-primary': '#ffffff',
                'bg-secondary': 'rgba(255, 255, 255, 0.95)',
                'bg-tertiary': 'rgba(240, 240, 240, 0.5)',
                'bg-accent': 'rgba(59, 130, 246, 0.1)',
                'bg-accent-hover': 'rgba(59, 130, 246, 0.2)',
                'bg-accent-active': 'rgba(59, 130, 246, 0.3)',
                'border-primary': 'rgba(200, 200, 200, 0.3)',
                'border-secondary': 'rgba(200, 200, 200, 0.2)',
                'border-accent': 'rgba(59, 130, 246, 0.3)',
                'text-primary': '#1a1a1a',
                'text-secondary': '#666666',
                'text-accent': '#3b82f6',
                'text-success': '#22c55e',
                'text-warning': '#f59e0b',
                'text-error': '#ef4444',
                'shadow-primary': '0 8px 32px rgba(0, 0, 0, 0.1)',
                'shadow-accent': '0 8px 25px rgba(59, 130, 246, 0.2)',
                'shadow-success': '0 8px 25px rgba(34, 197, 94, 0.2)',
                'shadow-error': '0 8px 25px rgba(239, 68, 68, 0.2)'
            }
        };

        return themes[themeName] || themes['default'];
    }

    updateCSSVariables(variables) {
        if (variables) {
            const root = document.documentElement;
            Object.entries(variables).forEach(([property, value]) => {
                root.style.setProperty(`--${property}`, value);
            });
        }
    }

    saveTheme(themeName) {
        // Save to database
        if (window.dbInitialized) {
            import('../quotes/db.js').then(({ getSettings, updateSettings }) => {
                getSettings((settings) => {
                    const updatedSettings = { ...settings, theme: themeName };
                    updateSettings(updatedSettings, () => {
                        console.log('Theme saved to database:', themeName);
                    });
                });
            }).catch(error => {
                console.error('Error saving theme:', error);
            });
        }
    }

    getThemePreview(themeName) {
        // Return a small preview of the theme colors
        const previews = {
            'default': '#3b82f6',
            'dark': '#3b82f6',
            'light': '#3b82f6',
            'purple': '#9333ea',
            'green': '#22c55e',
            'red': '#ef4444',
            'orange': '#f59e0b',
            'pink': '#ec4899',
            'cyan': '#06b6d4',
            'indigo': '#6366f1',
            'yellow': '#eab308',
            'gray': '#6b7280',
            'emerald': '#10b981',
            'teal': '#14b8a6',
            'violet': '#8b5cf6',
            'rose': '#f43f5e',
            'amber': '#f59e0b',
            'lime': '#84cc16',
            'sky': '#0ea5e9',
            'fuchsia': '#d946ef'
        };

        return previews[themeName] || '#3b82f6';
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
