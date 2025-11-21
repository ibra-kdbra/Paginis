// Theme Utilities
// Clean, reusable utilities for theme management

/**
 * Get the current theme with safe fallback
 * @returns {string} Current theme name or 'default'
 */
function getCurrentTheme() {
    return window.themeManager?.getCurrentTheme() || 'default';
}

/**
 * Apply theme classes to an element
 * @param {jQuery} element - jQuery element to apply theme to
 * @param {string} theme - Theme name
 */
function applyThemeClass(element, theme) {
    if (element && element.length && theme) {
        element.addClass(`theme-${theme} theme-applied`);
    }
}

/**
 * Remove theme classes from an element
 * @param {jQuery} element - jQuery element to remove theme from
 */
function removeThemeClasses(element) {
    if (element && element.length) {
        element.removeClass(function(index, className) {
            return (className.match(/theme-\w+/g) || []).join(' ');
        });
    }
}

/**
 * Get theme display name
 * @param {string} themeName - Theme name
 * @returns {string} Display name
 */
function getThemeDisplayName(themeName) {
    if (!themeName) return 'Default';

    return themeName.split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Get available theme categories for grouping
 * @returns {string[]} Theme categories
 */
function getThemeCategories() {
    return ['Core', 'Colors', 'Community'];
}

/**
 * Categorize themes for better UX
 * @returns {Object} Categorized themes
 */
function getCategorizedThemes() {
    const allThemes = window.themeManager?.getAllThemes() || [];

    return {
        Core: ['default', 'dark', 'light'],
        Colors: [
            'purple', 'green', 'red', 'orange', 'pink', 'cyan', 'indigo',
            'yellow', 'gray', 'emerald', 'teal', 'violet', 'rose', 'amber',
            'lime', 'sky', 'fuchsia', 'mint', 'lavender'
        ].filter(theme => allThemes.includes(theme)),
        Community: [
            'dracula', 'nord', 'gruvbox', 'solarized', 'monokai', 'tomorrow',
            'github', 'material', 'vscode', 'atom', 'xcode', 'sublime', 'jetbrains',
            'notepad', 'terminal', 'matrix', 'cyberpunk', 'ocean', 'forest',
            'sunset', 'midnight', 'cherry', 'coffee', 'neon', 'gold', 'silver',
            'bronze', 'platinum', 'slate', 'zinc', 'neutral', 'stone'
        ].filter(theme => allThemes.includes(theme))
    };
}

// Export functions for ES6 modules (if supported)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCurrentTheme,
        applyThemeClass,
        removeThemeClasses,
        getThemeDisplayName,
        getThemeCategories,
        getCategorizedThemes
    };
}

// Make available globally for backwards compatibility
if (typeof window !== 'undefined') {
    window.ThemeUtils = {
        getCurrentTheme,
        applyThemeClass,
        removeThemeClasses,
        getThemeDisplayName,
        getThemeCategories,
        getCategorizedThemes
    };
}
