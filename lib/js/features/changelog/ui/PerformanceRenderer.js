/**
 * Performance Renderer
 * Visualizes performance metrics as charts/stats
 */

export const PerformanceRenderer = {
  /**
   * Initialize performance visualization
   */
  initialize() {
    const container = document.getElementById('performanceStats');
    if (!container) return;

    // Start update loop
    this.updateStats();
    this.interval = setInterval(() => this.updateStats(), 2000);
  },

  /**
   * Update the stats UI with latest metrics
   */
  updateStats() {
    const container = document.getElementById('performanceStats');
    if (!container || !window.performanceMonitor) return;

    const metrics = window.performanceMonitor.getMetrics();
    const recommendations = window.performanceMonitor.getRecommendations();

    const stats = [
      {
        label: 'Memory Usage',
        value: this.getLatestMemory(metrics),
        unit: 'MB',
        icon: 'fa-memory',
        color: 'text-purple-400',
        progress: this.getMemoryProgress(metrics)
      },
      {
        label: 'Frame Rate',
        value: this.getLatestFPS(metrics),
        unit: 'FPS',
        icon: 'fa-tachometer-alt',
        color: 'text-green-400',
        progress: (this.getLatestFPS(metrics) / 60) * 100
      },
      {
        label: 'Page Load',
        value: this.getMetricValue(metrics.fcp),
        unit: 'ms',
        icon: 'fa-bolt',
        color: 'text-yellow-400',
        progress: Math.min((this.getMetricValue(metrics.fcp) / 2000) * 100, 100)
      }
    ];

    container.innerHTML = stats.map(stat => `
      <div class="bg-gray-800/50 border border-gray-700 p-6 rounded-xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-gray-700 rounded-lg ${stat.color}">
              <i class="fas ${stat.icon}"></i>
            </div>
            <span class="text-gray-300 font-medium">${stat.label}</span>
          </div>
          <span class="text-2xl font-bold text-white">${stat.value}<span class="text-xs text-gray-500 ml-1">${stat.unit}</span></span>
        </div>
        
        <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500" 
               style="width: ${Math.min(stat.progress, 100)}%"></div>
        </div>
      </div>
    `).join('');

    // Add recommendations if any
    if (recommendations.length > 0) {
        const recContainer = document.createElement('div');
        recContainer.className = 'col-span-full mt-4 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg text-yellow-200 text-sm';
        recContainer.innerHTML = `
            <div class="flex items-center space-x-2 mb-2">
                <i class="fas fa-lightbulb text-yellow-400"></i>
                <span class="font-bold uppercase tracking-wider">Optimization Suggestions</span>
            </div>
            <ul class="list-disc list-inside space-y-1 opacity-80">
                ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `;
        container.appendChild(recContainer);
    }
  },

  getMetricValue(metric) {
    return metric ? Math.round(metric.value) : 0;
  },

  getLatestMemory(metrics) {
    if (metrics.memoryStats && metrics.memoryStats.length > 0) {
      return metrics.memoryStats[metrics.memoryStats.length - 1].used;
    }
    return 0;
  },

  getMemoryProgress(metrics) {
    if (metrics.memoryStats && metrics.memoryStats.length > 0) {
      const latest = metrics.memoryStats[metrics.memoryStats.length - 1];
      return (latest.used / latest.limit) * 100;
    }
    return 0;
  },

  getLatestFPS(metrics) {
    if (metrics.fpsStats && metrics.fpsStats.length > 0) {
      return metrics.fpsStats[metrics.fpsStats.length - 1].fps;
    }
    return 60;
  }
};
