/**
 * Changelog Renderer
 * Handles all DOM manipulation and rendering operations
 */

import { CATEGORY_ICONS } from '../utils/ChangelogConfig.js';
import { ChangelogUtils } from '../utils/ChangelogUtils.js';

export class ChangelogRenderer {
  /**
   * Update version display elements
   * @param {string} version - Version string to display
   */
  static updateVersion(version) {
    // console.log('updateVersion called with:', version);
    const versionElements = ['currentVersion', 'footerVersion'];
    versionElements.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        // console.log('Found element:', id, 'setting to:', version || 'Unknown');
        element.textContent = version || 'Unknown';
      } else {
        // console.log('Element not found:', id);
      }
    });
  }

  /**
   * Update date display elements
   * @param {string} dateString - Date string to display
   */
  static updateDate(dateString) {
    const dateElement = document.getElementById('latestDate');
    if (dateElement) {
      dateElement.textContent = ChangelogUtils.formatDate(dateString);
    }
  }

  /**
   * Update commit count display elements
   * @param {number} count - Commit count to display
   */
  static updateCommitCount(count) {
    const commitElement = document.getElementById('commitCount');
    if (commitElement) {
      commitElement.textContent = ChangelogUtils.formatCommitCount(count);
    }

    const footerCommitsSpan = document.querySelector('#footerStatsCommits');
    if (footerCommitsSpan) {
      footerCommitsSpan.textContent = `${count}+`;
    }
  }

  /**
   * Update footer date display
   * @param {string} dateString - Date string to display
   */
  static updateFooterDate(dateString) {
    const footerDateSpan = document.querySelector('#footerStatsDate');
    if (footerDateSpan) {
      footerDateSpan.textContent = dateString ? ChangelogUtils.formatDate(dateString, false) : 'Unknown';
    }
  }

  /**
   * Render the entire changelog content
   * @param {Object} data - Parsed changelog data
   */
  static renderChangelog(data) {
    // Hide loading state
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
      loadingState.style.display = 'none';
    }

    // Render each section
    this.renderRecentUpdates(data.recent);
    this.renderFeatures(data.features);
    this.renderTechnicalImprovements(data.technical);
    this.renderBugFixes(data.bugfixes);
    this.renderNotes(data.notes);
    this.renderVersionTimeline(data.versions);

    // Configure marked options if available
    ChangelogUtils.configureMarked();
  }

  /**
   * Render recent updates section
   * @param {Array} recent - Recent updates data
   */
  /**
   * Render recent updates section with enhanced design
   * @param {Array} recent - Recent updates data
   */
  static renderRecentUpdates(recent) {
    const container = document.getElementById('recentUpdates');

    if (!container) return;

    if (!recent || recent.length === 0) {
      container.innerHTML = '<p class="text-gray-400 italic">No recent updates available.</p>';
      return;
    }

    container.innerHTML = recent.map(update => `
      <div class="group flex items-start space-x-4 p-5 bg-gray-800/40 rounded-xl border border-gray-700/60 hover:bg-gray-800/60 hover:border-blue-500/40 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/10">
        <div class="flex-shrink-0">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl flex items-center justify-center group-hover:from-blue-500/40 group-hover:to-purple-500/40 transition-all duration-300">
            <i class="fas fa-code-commit text-blue-400 group-hover:text-blue-300 transition-colors duration-300"></i>
          </div>
        </div>
        <div class="flex-1 min-w-0 space-y-2">
          <div class="flex flex-wrap items-center gap-3">
            <code class="px-3 py-1.5 bg-gray-700/70 text-blue-300 rounded-lg font-mono text-sm border border-gray-600/50 group-hover:border-blue-500/30 transition-colors duration-300">${update.hash.substring(0, 8)}</code>
            <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">${update.time}</span>
          </div>
          <p class="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 leading-relaxed">${update.message}</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render features section with enhanced readability
   * @param {Array} features - Features data
   */
  static renderFeatures(features) {
    const container = document.getElementById('featuresGrid');

    if (!container) return;

    if (!features || features.length === 0) {
      container.innerHTML = '<p class="text-gray-400 col-span-full">No features available.</p>';
      return;
    }

    // Horizontal flexbox layout - cards flow side by side with individual content-based heights
    container.className = 'flex flex-wrap justify-start gap-4 md:gap-6';

    // Iterate directly over subsections (data.features is already organized by subsection names)
    container.innerHTML = Object.entries(features).map(([subsectionName, items]) => {

      const config = CATEGORY_ICONS[subsectionName] || { icon: 'fa-star', color: 'emerald' };

      return `
        <div class="group w-80 flex-shrink-0 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6 hover:border-${config.color}-500/40 hover:shadow-xl hover:shadow-${config.color}-500/10 transition-all duration-300 ease-out hover:-translate-y-2">
          <!-- Subsection Header -->
          <div class="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-600/40">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-600/30 rounded-xl flex items-center justify-center group-hover:from-${config.color}-500/30 group-hover:to-${config.color}-600/40 transition-all duration-300">
              <i class="fas ${config.icon} text-${config.color}-400 text-lg group-hover:text-${config.color}-300 transition-colors duration-300"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg md:text-xl font-bold text-white group-hover:text-${config.color}-100 transition-colors duration-300 leading-tight">${subsectionName}</h3>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">${items.length} detailed updates</span>
                <div class="w-full h-0.5 bg-gradient-to-r from-${config.color}-500/40 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Full Detailed Items -->
          <div class="space-y-5">
            ${items.map((item, index) => {
              const contextualIcon = ChangelogUtils.getContextualIcon(item.title, item.description);
              return `
                <div class="group/item flex items-start space-x-4 p-3 rounded-lg bg-gray-700/20 border border-gray-600/20 hover:bg-gray-700/30 hover:border-${config.color}-400/30 transition-all duration-200 ease-in-out">
                  <div class="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-${config.color}-600/20 to-${config.color}-700/20 rounded-lg flex items-center justify-center group-hover/item:bg-${config.color}-500/30 transition-all duration-300">
                    <i class="fas ${contextualIcon} text-${config.color}-400 text-sm group-hover/item:text-${config.color}-300 transition-colors duration-300"></i>
                  </div>
                  <div class="flex-1 min-w-0 space-y-1">
                    <h4 class="text-white font-semibold text-base leading-relaxed group-hover/item:text-${config.color}-100 transition-colors duration-300">
                      ${ChangelogUtils.renderMarkdown(item.title)}
                    </h4>
                    <p class="text-gray-400 text-sm leading-relaxed group-hover/item:text-gray-300 transition-colors duration-300">
                      ${ChangelogUtils.renderMarkdown(item.description)}
                    </p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render technical improvements with enhanced readability
   * @param {Array} technical - Technical improvements data
   */
  static renderTechnicalImprovements(technical) {
    const container = document.getElementById('technicalImprovements');

    if (!container) return;

    if (!technical || technical.length === 0) {
      container.innerHTML = '<p class="text-gray-400 italic">No technical improvements available.</p>';
      return;
    }

    // Horizontal flexbox layout - cards flow side by side with individual content-based heights
    container.className = 'flex flex-wrap justify-start gap-4 md:gap-6';

    // Iterate directly over technical subsections (data.technical is already organized by subsection names)
    container.innerHTML = Object.entries(technical).map(([subsectionName, items]) => {
      const config = CATEGORY_ICONS[subsectionName] || { icon: 'fa-cogs', color: 'purple' };

      return `
        <div class="group w-80 flex-shrink-0 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6 hover:border-${config.color}-500/40 hover:shadow-xl hover:shadow-${config.color}-500/10 transition-all duration-300 ease-out hover:-translate-y-2">
          <!-- Subsection Header -->
          <div class="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-600/40">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-600/30 rounded-xl flex items-center justify-center group-hover:from-${config.color}-500/30 group-hover:to-${config.color}-600/40 transition-all duration-300">
              <i class="fas ${config.icon} text-${config.color}-400 text-lg group-hover:text-${config.color}-300 transition-colors duration-300"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg md:text-xl font-bold text-white group-hover:text-${config.color}-100 transition-colors duration-300 leading-tight">${subsectionName}</h3>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">${items.length} detailed updates</span>
                <div class="w-full h-0.5 bg-gradient-to-r from-${config.color}-500/40 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Full Detailed Technical Items -->
          <div class="space-y-5">
            ${items.map((item, index) => {
              const contextualIcon = ChangelogUtils.getContextualIcon(item.title, item.description);
              return `
                <div class="group/item flex items-start space-x-4 p-3 rounded-lg bg-gray-700/20 border border-gray-600/20 hover:bg-gray-700/30 hover:border-${config.color}-400/30 transition-all duration-200 ease-in-out">
                  <div class="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-${config.color}-600/20 to-${config.color}-700/20 rounded-lg flex items-center justify-center group-hover/item:bg-${config.color}-500/30 transition-all duration-300">
                    <i class="fas ${contextualIcon} text-${config.color}-400 text-sm group-hover/item:text-${config.color}-300 transition-colors duration-300"></i>
                  </div>
                  <div class="flex-1 min-w-0 space-y-1">
                    <h4 class="text-white font-semibold text-base leading-relaxed group-hover/item:text-${config.color}-100 transition-colors duration-300">
                      ${ChangelogUtils.renderMarkdown(item.title)}
                    </h4>
                    <p class="text-gray-400 text-sm leading-relaxed group-hover/item:text-gray-300 transition-colors duration-300">
                      ${ChangelogUtils.renderMarkdown(item.description)}
                    </p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render bug fixes section
   * @param {Array} bugfixes - Bug fixes data
   */
  static renderBugFixes(bugfixes) {
    const container = document.getElementById('bugFixes');

    if (!container) return;

    if (!bugfixes || bugfixes.length === 0) {
      container.innerHTML = '<p class="text-gray-400 italic">No bug fixes available.</p>';
      return;
    }

    // Horizontal flexbox layout - cards flow side by side with individual content-based heights
    container.className = 'flex flex-wrap justify-start gap-4 md:gap-6';

    // Iterate directly over bug fix subsections (data.bugfixes is already organized by subsection names)
    container.innerHTML = Object.entries(bugfixes).map(([subsectionName, items]) => {
      const config = CATEGORY_ICONS[subsectionName] || { icon: 'fa-bug', color: 'red' };

      return `
        <div class="group w-80 flex-shrink-0 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700/60 rounded-xl p-6 hover:border-${config.color}-500/40 hover:shadow-xl hover:shadow-${config.color}-500/10 transition-all duration-300 ease-out hover:-translate-y-2">
          <!-- Subsection Header -->
          <div class="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-600/40">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-${config.color}-500/20 to-${config.color}-600/30 rounded-xl flex items-center justify-center group-hover:from-${config.color}-500/30 group-hover:to-${config.color}-600/40 transition-all duration-300">
              <i class="fas ${config.icon} text-${config.color}-400 text-lg group-hover:text-${config.color}-300 transition-colors duration-300"></i>
            </div>
            <div class="flex-1">
              <h3 class="text-lg md:text-xl font-bold text-white group-hover:text-${config.color}-100 transition-colors duration-300 leading-tight">${subsectionName}</h3>
              <div class="flex items-center space-x-2 mt-1">
                <span class="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">${items.length} detailed fixes</span>
                <div class="w-full h-0.5 bg-gradient-to-r from-${config.color}-500/40 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>

          <!-- Full Detailed Bug Fix Items -->
          <div class="space-y-5">
            ${items.map((item, index) => {
              const contextualIcon = ChangelogUtils.getContextualIcon(item.title, item.description);
              return `
                <div class="group/item flex items-start space-x-4 p-3 rounded-lg bg-gray-700/20 border border-gray-600/20 hover:bg-gray-700/30 hover:border-${config.color}-400/30 transition-all duration-200 ease-in-out">
                  <div class="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-${config.color}-600/20 to-${config.color}-700/20 rounded-lg flex items-center justify-center group-hover/item:bg-${config.color}-500/30 transition-all duration-300">
                    <i class="fas ${contextualIcon} text-${config.color}-400 text-sm group-hover/item:text-${config.color}-300 transition-colors duration-300"></i>
                  </div>
                  <div class="flex-1 min-w-0 space-y-1">
                    <h4 class="text-white font-semibold text-base leading-relaxed group-hover/item:text-${config.color}-100 transition-colors duration-300">
                      ${ChangelogUtils.renderMarkdown(item.title)}
                    </h4>
                    <p class="text-gray-400 text-sm leading-relaxed group-hover/item:text-gray-300 transition-colors duration-300">
                      ${ChangelogUtils.renderMarkdown(item.description)}
                    </p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render notes section
   * @param {Array} notes - Notes data
   */
  static renderNotes(notes) {
    const container = document.getElementById('notesSection');

    if (!container) return;

    if (!notes || notes.length === 0) {
      container.innerHTML = '<p class="text-gray-400">No notes available.</p>';
      return;
    }

    container.innerHTML = `
      <div class="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
        <div class="flex items-center space-x-3 mb-6">
          <div class="p-3 bg-blue-600/20 rounded-lg">
            <i class="fas fa-sticky-note text-blue-400 text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-white">Notes</h2>
            <p class="text-gray-400">Additional information and observations</p>
          </div>
        </div>
        <div class="space-y-4">
          ${notes.map(note => `
            <div class="flex items-start space-x-3">
              <i class="fas fa-info-circle text-blue-400 mt-0.5"></i>
              <p class="text-gray-300">${ChangelogUtils.renderMarkdown(note)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render version timeline
   * @param {Array} versions - Versions data
   */
  static renderVersionTimeline(versions) {
    const container = document.getElementById('versionTimeline');

    if (!container) return;

    if (!versions || versions.length === 0) {
      container.innerHTML = '<p class="text-gray-400">No version history available.</p>';
      return;
    }

    container.innerHTML = versions.map((version, index) => `
      <div class="timeline-item">
        <div class="version-card p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <i class="fas fa-tag text-orange-400"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-white">${version.version}</h3>
                <p class="text-gray-400 text-sm">${version.status}</p>
              </div>
            </div>
            <span class="badge-${version.status.toLowerCase() === 'latest' ? 'new' : 'feature'}">
              ${version.status}
            </span>
          </div>
          ${version.features && version.features.length > 0 ? `
            <div class="space-y-2">
              <h4 class="text-white font-medium mb-3">What's New:</h4>
              <ul class="space-y-2">
                ${version.features.map(feature => `
                  <li class="flex items-start space-x-2 text-gray-300">
                    <i class="fas fa-dot-circle text-orange-400 mt-0.5 text-xs"></i>
                    <span class="text-sm">${ChangelogUtils.renderMarkdown(feature)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  /**
   * Show loading state
   */
  static showLoading() {
    const loadingState = document.getElementById('loadingState');
    const changelogContent = document.getElementById('changelogContent');

    if (loadingState && changelogContent) {
      loadingState.style.display = 'block';
    }
  }

  /**
   * Show error state
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  static showError(message, error) {
    const loadingState = document.getElementById('loadingState');

    if (loadingState) {
      loadingState.innerHTML = `
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-white mb-2">Failed to Load Changelog</h3>
          <p class="text-gray-400">Please check the console for details or try refreshing the page.</p>
          <p class="text-sm text-gray-500 mt-2">Error: ${error?.message || message}</p>
        </div>
      `;
    }
  }

  /**
   * Initialize smooth scrolling for navigation
   */
  static initializeNavigation() {
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  /**
   * Initialize scroll animations
   */
  static initializeAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up');
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('main > section').forEach(section => {
      observer.observe(section);
    });
  }
}
