/**
 * Changelog Utility Functions
 * Helper functions for changelog processing and formatting
 */

export class ChangelogUtils {
  /**
   * Format date for display
   * @param {string} dateString - Date in 'YYYY-MM-DD' format
   * @param {boolean} includeLatest - Whether to include "Latest:" prefix
   * @returns {string} Formatted date string
   */
  static formatDate(dateString, includeLatest = true) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    return includeLatest ? `Latest: ${formattedDate}` : formattedDate;
  }

  /**
   * Format commit count for display
   * @param {number} count - Number of commits
   * @returns {string} Formatted commit count string
   */
  static formatCommitCount(count) {
    return `${count}+ Commits`;
  }

  /**
   * Render markdown text with basic formatting
   * @param {string} text - Markdown text
   * @returns {string} HTML formatted text
   */
  static renderMarkdown(text) {
    if (!text) return '';

    // Basic inline code formatting
    let processedText = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    try {
      // Use marked for advanced markdown parsing if available, otherwise return processed text
      if (typeof marked !== 'undefined') {
        return marked.parse(processedText);
      }
      return processedText;
    } catch (e) {
      return processedText;
    }
  }

  /**
   * Get contextual icon for technical improvements/features
   * @param {string} title - Item title
   * @param {string} description - Item description
   * @returns {string} FontAwesome icon class
   */
  static getContextualIcon(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    // Security/Validation
    if (titleLower.includes('validation') || titleLower.includes('security') ||
        descLower.includes('xss') || descLower.includes('sanitize') || descLower.includes('input')) {
      return 'fa-shield-alt';
    }

    // State/Memory management
    if (titleLower.includes('state') || titleLower.includes('management') ||
        descLower.includes('global') || descLower.includes('memory')) {
      return 'fa-brain';
    }

    // Mobile/Touch
    if (titleLower.includes('mobile') || titleLower.includes('touch') ||
        descLower.includes('gesture') || descLower.includes('responsive')) {
      return 'fa-mobile-alt';
    }

    // Browser compatibility
    if (titleLower.includes('compatibility') || titleLower.includes('browser') ||
        descLower.includes('feature') || descLower.includes('support')) {
      return 'fa-globe';
    }

    // Performance
    if (titleLower.includes('performance') || descLower.includes('speed') ||
        descLower.includes('optimization')) {
      return 'fa-tachometer-alt';
    }

    // Error handling
    if (titleLower.includes('error') || titleLower.includes('handling') ||
        descLower.includes('exception') || descLower.includes('try-catch')) {
      return 'fa-exclamation-triangle';
    }

    // System architecture
    if (titleLower.includes('architecture') || titleLower.includes('system') ||
        descLower.includes('framework')) {
      return 'fa-building';
    }

    // Code organization
    if (titleLower.includes('organization') || titleLower.includes('code') ||
        descLower.includes('structure') || descLower.includes('module')) {
      return 'fa-code';
    }

    // Default checkmark
    return 'fa-check';
  }

  /**
   * Clean subsection title by removing emoji prefix
   * @param {string} line - Raw subsection line
   * @returns {string} Cleaned title
   */
  static cleanSubsectionTitle(line) {
    return line.replace(/^###\s*[^\s]+\s*/, '').trim();
  }

  /**
   * Check if line matches a subsection pattern
   * @param {string} line - Line to check
   * @param {Array} prefixes - Array of prefixes to check against
   * @returns {boolean} Whether line matches any prefix
   */
  static isSubsectionLine(line, prefixes) {
    return prefixes.some(prefix => line.startsWith(prefix));
  }

  /**
   * Check if line is a feature/bug item (starts with '- ')
   * @param {string} line - Line to check
   * @returns {boolean} Whether line is an item
   */
  static isItemLine(line) {
    return line.trim().startsWith('- ');
  }

  /**
   * Parse an item line into title and description
   * @param {string} line - Item line
   * @returns {Object} {title, description}
   */
  static parseItemLine(line) {
    const trimmedLine = line.substring(line.indexOf('- ') + 2).trim();

    // Check if line contains ": " to split title and description
    const colonIndex = trimmedLine.indexOf(': ');
    if (colonIndex !== -1) {
      return {
        title: trimmedLine.substring(0, colonIndex).trim(),
        description: trimmedLine.substring(colonIndex + 2).trim()
      };
    }

    // If no colon, treat entire line as title
    return {
      title: trimmedLine,
      description: ''
    };
  }

  /**
   * Group items by category
   * @param {Array} items - Array of items with category property
   * @returns {Object} Grouped items by category
   */
  static groupByCategory(items) {
    const categories = {};
    items.forEach(item => {
      const category = item.category || 'General';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });
    return categories;
  }

  /**
   * Get section parser based on section type
   * @param {string} sectionType - Type of section
   * @returns {Function} Parser function for the section
   */
  static getSectionParser(sectionType) {
    const parsers = {
      recent: (line, data) => {
        const match = line.match(/- `([^`]+)` - ([^(]+)\s*\(([^)]+)\)/);
        if (match) {
          data.recent.push({
            hash: match[1],
            message: match[2].trim(),
            time: match[3]
          });
        }
      },
      notes: (line, data) => {
        let note = line.substring(2).replace(/^\*\*(.+)\*\*$/, '$1');
        data.notes.push(note);
      }
    };

    return parsers[sectionType] || (() => {}); // Return no-op for unknown sections
  }

  /**
   * Configure marked options if available
   */
  static configureMarked() {
    if (typeof marked !== 'undefined') {
      marked.setOptions({
        breaks: true,
        gfm: true,
        sanitize: false
      });
    }
  }
}
