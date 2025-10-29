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

  // Render features section
  function renderFeatures(features) {
    const container = document.getElementById('featuresGrid');

    if (features.length === 0) {
      container.innerHTML = '<p class="text-gray-400 col-span-full">No features available.</p>';
      return;
    }

    // Group features by category
    const categories = {};
    features.forEach(feature => {
      if (!categories[feature.category]) {
        categories[feature.category] = [];
      }
      categories[feature.category].push(feature);
    });

    container.innerHTML = Object.entries(categories).map(([category, items]) => `
      <div class="feature-card">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-green-600/20 rounded-lg">
            <i class="fas fa-star text-green-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-white">${category}</h3>
        </div>
        <div class="space-y-3">
          ${items.map(item => `
            <div class="flex items-start space-x-3">
              <i class="fas fa-check-circle text-green-400 mt-0.5 text-sm"></i>
              <div>
                <h4 class="text-white font-medium text-sm">${renderMarkdown(item.title)}</h4>
                <p class="text-gray-400 text-sm mt-1">${renderMarkdown(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Render technical improvements
  function renderTechnicalImprovements(technical) {
    const container = document.getElementById('technicalImprovements');

    if (technical.length === 0) {
      container.innerHTML = '<p class="text-gray-400">No technical improvements available.</p>';
      return;
    }

    // Group technical improvements by category
    const categories = {};
    technical.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = [];
      }
      categories[item.category].push(item);
    });

    container.innerHTML = Object.entries(categories).map(([category, items]) => `
      <div class="feature-card">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-purple-600/20 rounded-lg">
            <i class="fas fa-cogs text-purple-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-white">${category}</h3>
        </div>
        <div class="space-y-3">
          ${items.map(item => `
            <div class="flex items-start space-x-3">
              <i class="fas fa-check-circle text-purple-400 mt-0.5 text-sm"></i>
              <div>
                <h4 class="text-white font-medium text-sm">${renderMarkdown(item.title)}</h4>
                <p class="text-gray-400 text-sm mt-1">${renderMarkdown(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  // Render bug fixes
  function renderBugFixes(bugfixes) {
    const container = document.getElementById('bugFixes');

    if (bugfixes.length === 0) {
      container.innerHTML = '<p class="text-gray-400">No bug fixes available.</p>';
      return;
    }

    // Group bug fixes by category
    const categories = {};
    bugfixes.forEach(bugfix => {
      if (!categories[bugfix.category]) {
        categories[bugfix.category] = [];
      }
      categories[bugfix.category].push(bugfix);
    });

    container.innerHTML = Object.entries(categories).map(([category, items]) => `
      <div class="feature-card">
        <div class="flex items-center space-x-3 mb-4">
          <div class="p-2 bg-red-600/20 rounded-lg">
            <i class="fas fa-bug text-red-400"></i>
          </div>
          <h3 class="text-lg font-semibold text-white">${category}</h3>
        </div>
        <div class="space-y-3">
          ${items.map(item => `
            <div class="flex items-start space-x-3">
              <i class="fas fa-check-circle text-red-400 mt-0.5 text-sm"></i>
              <div>
                <h4 class="text-white font-medium text-sm">${renderMarkdown(item.title)}</h4>
                <p class="text-gray-400 text-sm mt-1">${renderMarkdown(item.description)}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
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
