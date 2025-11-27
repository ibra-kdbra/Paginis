/**
 * Changelog Configuration Constants
 * Centralized configuration for the changelog system
 */

export const CHANGELOG_SECTIONS = {
  RECENT: 'recent',
  FEATURES: 'features',
  TECHNICAL: 'technical',
  BUGFIXES: 'bugfixes',
  VERSIONS: 'versions',
  NOTES: 'notes'
};

export const CHANGELOG_HEADERS = {
  [CHANGELOG_SECTIONS.RECENT]: '## 🎯 Recent Updates (Latest commits)',
  [CHANGELOG_SECTIONS.FEATURES]: '## 🚀 Major Features & Improvements',
  [CHANGELOG_SECTIONS.TECHNICAL]: '## 🔧 Technical Improvements',
  [CHANGELOG_SECTIONS.BUGFIXES]: '## 🐛 Bug Fixes & Maintenance',
  [CHANGELOG_SECTIONS.VERSIONS]: '## 🔄 Version History',
  [CHANGELOG_SECTIONS.NOTES]: '## 📝 Notes'
};

export const SUBSECTION_PREFIXES = {
  [CHANGELOG_SECTIONS.FEATURES]: ['### ✨', '### 💬', '### 📄', '### 🎨', '### 🔒', '### 🏗️', '### 📱'],
  [CHANGELOG_SECTIONS.TECHNICAL]: ['### 🛡️', '### 🏛️', '### 📁', '### ⚡', '### 🔗'],
  [CHANGELOG_SECTIONS.BUGFIXES]: ['### ✅', '### 🧹']
};

export const CATEGORY_ICONS = {
  // Feature categories
  'Icon System & UI Enhancement': { icon: 'fa-palette', color: 'emerald' },
  'Quotes System': { icon: 'fa-quote-right', color: 'sky' },
  'PDF & Media Features': { icon: 'fa-file-pdf', color: 'purple' },
  'UI/UX Improvements': { icon: 'fa-user-experience', color: 'yellow' },
  'Security & Input Validation Overhaul (Phase 1)': { icon: 'fa-shield-alt', color: 'red' },
  'Architecture & State Management Refactor (Phase 2)': { icon: 'fa-building', color: 'blue' },
  'Mobile & UX Experience Enhancement (Phase 3)': { icon: 'fa-mobile-alt', color: 'teal' },

  // Technical categories
  'Security Architecture': { icon: 'fa-shield-alt', color: 'emerald' },
  'System Architecture': { icon: 'fa-building', color: 'blue' },
  'Mobile-First Architecture': { icon: 'fa-mobile-alt', color: 'cyan' },
  'Code Organization': { icon: 'fa-folder-tree', color: 'yellow' },
  'Performance & Compatibility': { icon: 'fa-tachometer-alt', color: 'orange' },
  'URL & Share System': { icon: 'fa-share-alt', color: 'purple' },

  // Bug fix categories
  'Recent Fixes': { icon: 'fa-wrench', color: 'emerald' },
  'Code Cleanup': { icon: 'fa-broom', color: 'cyan' }
};

export const GITHUB_REPO_INFO = {
  owner: 'ibra-kdbra',
  repo: 'Paginis',
  apiUrl: 'https://api.github.com/repos/ibra-kdbra/Paginis'
};

export const DEFAULT_VALUES = {
  VERSION: '4.1.3',
  DATE: '2025-11-15',
  COMMIT_COUNT: 105,
  LATEST_DATE_TEXT: 'Latest: Nov 24, 2025',
  COMMIT_COUNT_TEXT: '100+ Commits'
};

export const REGEX_PATTERNS = {
  VERSION: /### (v\d+\.\d+\.\d+)/,
  VERSION_WITH_STATUS: /### (v\d+\.\d+\.\d+)(?:\s*\(([^)]+)\))?/,
  COMMIT_LINE: /- `([^`]+)` - ([^(]+)\s*\(([^)]+)\)/,
  FEATURE_ITEM: /- ([^:]+): (.+)/,
  DATE_FROM_COMMIT: /\((\d{4}-\d{2}-\d{2})\)/,
  SUBSECTION_CLEAN: /^###\s*(💬|📄|🎨|📁|⚡|🔗|🛡️|🏛️|📱|✨|✅|🧹)\s*/
};
