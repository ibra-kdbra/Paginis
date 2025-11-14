/**
 * Modern Changelog Page JavaScript
 * Parses CHANGELOG.md and creates structured, interactive UI components
 */

document.addEventListener('DOMContentLoaded', function() {
  const loadingState = document.getElementById('loadingState');
  const changelogContent = document.getElementById('changelogContent');

  // Function to load and parse changelog
  async function loadChangelog() {
    try {
      const response = await fetch('CHANGELOG.md');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const markdown = await response.text();
      const parsedData = parseChangelog(markdown);

      // Configure marked for better code rendering
      marked.setOptions({
        breaks: true,
        gfm: true,
        sanitize: false
      });

      // Hide loading state
      loadingState.style.display = 'none';

      // Render structured content
      renderChangelog(parsedData);

    } catch (error) {
      console.error('Error loading changelog:', error);
      loadingState.innerHTML = `
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-3xl text-red-400 mb-4"></i>
          <h3 class="text-xl font-semibold text-white mb-2">Failed to Load Changelog</h3>
          <p class="text-gray-400">Please check the console for details or try refreshing the page.</p>
          <p class="text-sm text-gray-500 mt-2">Error: ${error.message}</p>
        </div>
      `;
    }
  }

  function renderMarkdown(text) {
    if (!text) return '';

    let processedText = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    try {
      let html = marked.parse(processedText);
      return html;
    } catch (e) {
      return processedText;
    }
  }

  // Helper function to choose contextual icons for technical improvements
  function getContextualIcon(title, description) {
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();

    if (titleLower.includes('validation') || titleLower.includes('security') ||
        descLower.includes('xss') || descLower.includes('sanitize') || descLower.includes('input')) {
      return 'fa-shield-alt'; // Security/Validation
    } else if (titleLower.includes('state') || titleLower.includes('management') ||
               descLower.includes('global') || descLower.includes('memory')) {
      return 'fa-brain'; // State/Memory management
    } else if (titleLower.includes('mobile') || titleLower.includes('touch') ||
               descLower.includes('gesture') || descLower.includes('responsive')) {
      return 'fa-mobile-alt'; // Mobile/Touch
    } else if (titleLower.includes('compatibility') || titleLower.includes('browser') ||
               descLower.includes('feature') || descLower.includes('support')) {
      return 'fa-globe'; // Browser compatibility
    } else if (titleLower.includes('performance') || descLower.includes('speed') ||
               descLower.includes('optimization')) {
      return 'fa-tachometer-alt'; // Performance
    } else if (titleLower.includes('error') || titleLower.includes('handling') ||
               descLower.includes('exception') || descLower.includes('try-catch')) {
      return 'fa-exclamation-triangle'; // Error handling
    } else if (titleLower.includes('architecture') || titleLower.includes('system') ||
               descLower.includes('framework')) {
      return 'fa-building'; // System architecture
    } else if (titleLower.includes('organization') || titleLower.includes('code') ||
               descLower.includes('structure') || descLower.includes('module')) {
      return 'fa-code'; // Code organization
    } else {
      return 'fa-check'; // Default checkmark
    }
  }

  // Parse changelog markdown into structured data
  function parseChangelog(markdown) {
    const lines = markdown.split('\n');
    const data = {
      recent: [],
      features: [],
      technical: [],
      bugfixes: [],
      versions: [],
      notes: []
    };

    let currentSection = '';
    let currentSubsection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Detect main sections - match exact headers from CHANGELOG.md
      if (line.startsWith('## 🎯 Recent Updates (Latest 3 commits)')) {
        currentSection = 'recent';
      } else if (line.startsWith('## 🚀 Major Features & Improvements')) {
        currentSection = 'features';
      } else if (line.startsWith('## 🔧 Technical Improvements')) {
        currentSection = 'technical';
      } else if (line.startsWith('## 🐛 Bug Fixes & Maintenance')) {
        currentSection = 'bugfixes';
      } else if (line.startsWith('## 🔄 Version History')) {
        currentSection = 'versions';
      } else if (line.startsWith('## 📝 Notes')) {
        currentSection = 'notes';
      }

      // Parse recent updates
      if (currentSection === 'recent' && line.startsWith('- `')) {
        const commitMatch = line.match(/- `([^`]+)` - ([^(]+)\s*\(([^)]+)\)/);
        if (commitMatch) {
          data.recent.push({
            hash: commitMatch[1],
            message: commitMatch[2].trim(),
            time: commitMatch[3]
          });
        }
      }

      // Parse features and improvements
      if (currentSection === 'features') {
        if (line.startsWith('### ✨')) {
          currentSubsection = line.replace('### ✨', '').trim();
        } else if (line.startsWith('### 💬')) {
          currentSubsection = line.replace('### 💬', '').trim();
        } else if (line.startsWith('### 📄')) {
          currentSubsection = line.replace('### 📄', '').trim();
        } else if (line.startsWith('### 🎨')) {
          currentSubsection = line.replace('### 🎨', '').trim();
        } else if (line.startsWith('- ') && currentSubsection && line.includes(':')) {
          const featureMatch = line.match(/- ([^:]+): (.+)/);
          if (featureMatch) {
            data.features.push({
              category: currentSubsection,
              title: featureMatch[1].trim(),
              description: featureMatch[2].trim()
            });
          }
        }
      }

      // Parse technical improvements
      if (currentSection === 'technical') {
        if (line.startsWith('### 📁')) {
          currentSubsection = line.replace('### 📁', '').trim();
        } else if (line.startsWith('### ⚡')) {
          currentSubsection = line.replace('### ⚡', '').trim();
        } else if (line.startsWith('### 🔗')) {
          currentSubsection = line.replace('### 🔗', '').trim();
        } else if (line.startsWith('### 🛡️')) {
          currentSubsection = line.replace('### 🛡️', '').trim();
        } else if (line.startsWith('### 🏛️')) {
          currentSubsection = line.replace('### 🏛️', '').trim();
        } else if (line.startsWith('### 📱')) {
          currentSubsection = line.replace('### 📱', '').trim();
        } else if (line.startsWith('- ') && currentSubsection && line.includes(':')) {
          const techMatch = line.match(/- ([^:]+): (.+)/);
          if (techMatch) {
            data.technical.push({
              category: currentSubsection,
              title: techMatch[1].trim(),
              description: techMatch[2].trim()
            });
          }
        }
      }

      // Parse bug fixes & maintenance
      if (currentSection === 'bugfixes') {
        if (line.startsWith('### ✅')) {
          currentSubsection = line.replace('### ✅', '').trim();
        } else if (line.startsWith('### 🧹')) {
          currentSubsection = line.replace('### 🧹', '').trim();
        } else if (line.startsWith('- ') && currentSubsection && line.includes(':')) {
          const bugMatch = line.match(/- ([^:]+): (.+)/);
          if (bugMatch) {
            data.bugfixes.push({
              category: currentSubsection,
              title: bugMatch[1].trim(),
              description: bugMatch[2].trim()
            });
          }
        }
      }

      // Parse notes
      if (currentSection === 'notes' && line.startsWith('- ')) {
        let note = line.substring(2).replace(/^\*\*(.+)\*\*$/, '$1'); // Strip ** if present
        data.notes.push(note);
      }

      // Parse version history
      if (currentSection === 'versions' && line.startsWith('### v')) {
        const versionMatch = line.match(/### (v\d+\.\d+\.\d+)(?:\s*\(([^)]+)\))?/);
        if (versionMatch) {
          const version = {
            version: versionMatch[1],
            status: versionMatch[2] || 'Release',
            features: []
          };

          // Collect features for this version
          let j = i + 1;
          while (j < lines.length && !lines[j].startsWith('### v') && !lines[j].startsWith('---')) {
            const featureLine = lines[j].trim();
            if (featureLine.startsWith('- ')) {
              version.features.push(featureLine.substring(2));
            }
            j++;
          }

          data.versions.push(version);
        }
      }
    }

    return data;
  }

  // Render the structured changelog
  function renderChangelog(data) {
    // Render recent updates
    renderRecentUpdates(data.recent);

    // Render features
    renderFeatures(data.features);

    // Render technical improvements
    renderTechnicalImprovements(data.technical);

    // Render bug fixes
    renderBugFixes(data.bugfixes);

    // Render notes
    renderNotes(data.notes);

    // Render version timeline
    renderVersionTimeline(data.versions);
  }

  // Render recent updates section
  function renderRecentUpdates(recent) {
    const container = document.getElementById('recentUpdates');

    if (recent.length === 0) {
      container.innerHTML = '<p class="text-gray-400">No recent updates available.</p>';
      return;
    }

    container.innerHTML = recent.map(update => `
      <div class="flex items-start space-x-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:bg-gray-800/70 transition-colors">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <i class="fas fa-code-commit text-blue-400"></i>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center space-x-2 mb-1">
            <code class="text-xs bg-gray-700 px-2 py-1 rounded font-mono text-blue-300">${update.hash}</code>
            <span class="text-xs text-gray-500">${update.time}</span>
          </div>
          <p class="text-gray-300 text-sm">${update.message}</p>
        </div>
      </div>
    `).join('');
  }

  // Render features section with enhanced readability
  function renderFeatures(features) {
    const container = document.getElementById('featuresGrid');

    if (features.length === 0) {
      container.innerHTML = '<p class="text-gray-400 col-span-full">No features available.</p>';
      return;
    }

    // Define category icons and colors
    const categoryConfig = {
      'Icon System & UI Enhancement': { icon: 'fa-palette', color: 'emerald' },
      'Quotes System': { icon: 'fa-quote-right', color: 'sky' },
      'PDF & Media Features': { icon: 'fa-file-pdf', color: 'purple' },
      'UI/UX Improvements': { icon: 'fa-user-experience', color: 'yellow' },
      'Security & Input Validation Overhaul': { icon: 'fa-shield-alt', color: 'emerald' },
      'Architecture & State Management Refactor': { icon: 'fa-building', color: 'blue' },
      'Mobile & UX Experience Enhancement': { icon: 'fa-mobile-alt', color: 'cyan' }
    };

    // Group features by category
    const categories = {};
    features.forEach(feature => {
      if (!categories[feature.category]) {
        categories[feature.category] = [];
      }
      categories[feature.category].push(feature);
    });

    container.innerHTML = Object.entries(categories).map(([category, items]) => {
      const config = categoryConfig[category] || { icon: 'fa-star', color: 'green' };

      return `
        <div class="mb-8 border border-gray-700/50 rounded-xl p-6">
          <!-- Category Header -->
          <div class="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-700/50">
            <div class="flex items-center space-x-3">
              <i class="fas ${config.icon} text-${config.color}-400 text-xl"></i>
              <h3 class="text-xl font-semibold text-white">${category}</h3>
            </div>
          </div>

          <!-- Feature Items -->
          <div class="pl-8">
            <div class="space-y-6">
              ${items.map((item, index) => {
                const contextualIcon = getContextualIcon(item.title, item.description);
                return `
                  <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0 w-8 h-8 bg-${config.color}-600/25 rounded-full flex items-center justify-center mt-1">
                      <i class="fas ${contextualIcon} text-${config.color}-400 text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-white font-semibold text-lg leading-relaxed mb-2">
                        ${renderMarkdown(item.title)}
                      </h4>
                      <p class="text-gray-400 text-base leading-relaxed">
                        ${renderMarkdown(item.description)}
                      </p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render technical improvements with enhanced readability and contextual icons
  function renderTechnicalImprovements(technical) {
    const container = document.getElementById('technicalImprovements');

    if (technical.length === 0) {
      container.innerHTML = '<p class="text-gray-400">No technical improvements available.</p>';
      return;
    }

    // Define category icons and colors
    const categoryConfig = {
      'Security Architecture': { icon: 'fa-shield-alt', color: 'emerald' },
      'System Architecture': { icon: 'fa-building', color: 'blue' },
      'Mobile-First Architecture': { icon: 'fa-mobile-alt', color: 'cyan' },
      'Code Organization': { icon: 'fa-folder-tree', color: 'yellow' },
      'Performance & Compatibility': { icon: 'fa-tachometer-alt', color: 'orange' },
      'URL & Share System': { icon: 'fa-share-alt', color: 'purple' }
    };

    // Group technical improvements by category
    const categories = {};
    technical.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    container.innerHTML = Object.entries(categories).map(([category, items]) => {
      const config = categoryConfig[category] || { icon: 'fa-cogs', color: 'purple' };

      return `
        <div class="mb-8 border border-gray-700/50 rounded-xl p-6">
          <!-- Category Header -->
          <div class="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-700/50">
            <div class="flex items-center space-x-3">
              <i class="fas ${config.icon} text-${config.color}-400 text-xl"></i>
              <h3 class="text-xl font-semibold text-white">${category}</h3>
            </div>
          </div>

          <!-- Technical Items -->
          <div class="pl-8">
            <div class="space-y-6">
              ${items.map((item, index) => {
                const contextualIcon = getContextualIcon(item.title, item.description);
                return `
                  <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0 w-8 h-8 bg-${config.color}-600/25 rounded-full flex items-center justify-center mt-1">
                      <i class="fas ${contextualIcon} text-${config.color}-400 text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-white font-semibold text-lg leading-relaxed mb-2">
                        ${renderMarkdown(item.title)}
                      </h4>
                      <p class="text-gray-400 text-base leading-relaxed">
                        ${renderMarkdown(item.description)}
                      </p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render bug fixes with enhanced readability
  function renderBugFixes(bugfixes) {
    const container = document.getElementById('bugFixes');

    if (bugfixes.length === 0) {
      container.innerHTML = '<p class="text-gray-400">No bug fixes available.</p>';
      return;
    }

    // Define category icons and colors
    const categoryConfig = {
      'Recent Fixes': { icon: 'fa-wrench', color: 'emerald' },
      'Code Cleanup': { icon: 'fa-broom', color: 'cyan' }
    };

    // Group bug fixes by category
    const categories = {};
    bugfixes.forEach(bugfix => {
      if (!categories[bugfix.category]) {
        categories[bugfix.category] = [];
      }
      categories[bugfix.category].push(bugfix);
    });

    container.innerHTML = Object.entries(categories).map(([category, items]) => {
      const config = categoryConfig[category] || { icon: 'fa-bug', color: 'red' };

      return `
        <div class="mb-8 border border-gray-700/50 rounded-xl p-6">
          <!-- Category Header -->
          <div class="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-700/50">
            <div class="flex items-center space-x-3">
              <i class="fas ${config.icon} text-${config.color}-400 text-xl"></i>
              <h3 class="text-xl font-semibold text-white">${category}</h3>
            </div>
          </div>

          <!-- Bug Fix Items -->
          <div class="pl-8">
            <div class="space-y-6">
              ${items.map((item, index) => {
                const contextualIcon = getContextualIcon(item.title, item.description);
                return `
                  <div class="flex items-start space-x-4">
                    <div class="flex-shrink-0 w-8 h-8 bg-${config.color}-600/25 rounded-full flex items-center justify-center mt-1">
                      <i class="fas ${contextualIcon} text-${config.color}-400 text-sm"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="text-white font-semibold text-lg leading-relaxed mb-2">
                        ${renderMarkdown(item.title)}
                      </h4>
                      <p class="text-gray-400 text-base leading-relaxed">
                        ${renderMarkdown(item.description)}
                      </p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render notes
  function renderNotes(notes) {
    const container = document.getElementById('notesSection');

    if (notes.length === 0) {
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
              <p class="text-gray-300">${renderMarkdown(note)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Render version timeline
  function renderVersionTimeline(versions) {
    const container = document.getElementById('versionTimeline');

    if (versions.length === 0) {
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
          ${version.features.length > 0 ? `
            <div class="space-y-2">
              <h4 class="text-white font-medium mb-3">What's New:</h4>
              <ul class="space-y-2">
                ${version.features.map(feature => `
                  <li class="flex items-start space-x-2 text-gray-300">
                    <i class="fas fa-dot-circle text-orange-400 mt-0.5 text-xs"></i>
                    <span class="text-sm">${renderMarkdown(feature)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // Smooth scrolling for navigation links
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

  // Add intersection observer for animations
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

  // Load the changelog when the page loads
  loadChangelog();
});
