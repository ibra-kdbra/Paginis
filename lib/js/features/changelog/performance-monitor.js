/**
 * Core Web Vitals and Performance Monitoring
 * Tracks LCP, FID, CLS and other performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      lcp: null,
      fid: null,
      cls: null,
      fcp: null,
      ttfb: null
    };

    this.observers = {};
    this.isMonitoring = false;
    this.startTime = null;
    this.memoryStats = [];
    this.fpsStats = [];
  }

  /**
   * Initialize performance monitoring
   */
  initialize() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.startTime = performance.now();

    console.log('[Performance] Starting monitoring...');

    this.setupWebVitalsObservers();
    this.startMemoryMonitoring();
    this.startFPSMonitoring();
    this.trackPageLoadMetrics();

    // Monitor for performance issues
    this.setupPerformanceObserver();
  }

  /**
   * Stop performance monitoring
   */
  stop() {
    this.isMonitoring = false;

    // Disconnect all observers
    Object.values(this.observers).forEach(observer => {
      if (observer && typeof observer.disconnect === 'function') {
        observer.disconnect();
      }
    });

    this.observers = {};
    console.log('[Performance] Monitoring stopped');
  }

  /**
   * Set up Core Web Vitals observers
   */
  setupWebVitalsObservers() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        this.observers.lcp = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = {
            value: lastEntry.startTime,
            element: lastEntry.element,
            size: lastEntry.size,
            timestamp: Date.now()
          };
          console.log('[Performance] LCP:', this.metrics.lcp.value.toFixed(2) + 'ms');
        });
        this.observers.lcp.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('[Performance] LCP observer not supported:', error);
      }

      // First Input Delay (FID)
      try {
        this.observers.fid = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.metrics.fid = {
              value: entry.processingStart - entry.startTime,
              eventType: entry.name,
              timestamp: Date.now()
            };
            console.log('[Performance] FID:', this.metrics.fid.value.toFixed(2) + 'ms');
          });
        });
        this.observers.fid.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('[Performance] FID observer not supported:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        this.observers.cls = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = {
            value: clsValue,
            timestamp: Date.now()
          };
          console.log('[Performance] CLS:', this.metrics.cls.value.toFixed(4));
        });
        this.observers.cls.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('[Performance] CLS observer not supported:', error);
      }

      // First Contentful Paint (FCP)
      try {
        this.observers.fcp = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.fcp = {
            value: lastEntry.startTime,
            timestamp: Date.now()
          };
          console.log('[Performance] FCP:', this.metrics.fcp.value.toFixed(2) + 'ms');
        });
        this.observers.fcp.observe({ entryTypes: ['paint'] });
      } catch (error) {
        console.warn('[Performance] FCP observer not supported:', error);
      }
    }
  }

  /**
   * Track page load metrics
   */
  trackPageLoadMetrics() {
    // Time to First Byte (TTFB)
    if ('performance' in window && performance.timing) {
      const timing = performance.timing;
      const ttfb = timing.responseStart - timing.requestStart;

      this.metrics.ttfb = {
        value: ttfb,
        timestamp: Date.now()
      };

      console.log('[Performance] TTFB:', ttfb + 'ms');
    }

    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', () => {
      const domContentLoadedTime = performance.now();
      console.log('[Performance] DOM Content Loaded:', domContentLoadedTime.toFixed(2) + 'ms');
    });

    // Page Load Complete
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log('[Performance] Page Load Complete:', loadTime.toFixed(2) + 'ms');

      // Check for performance issues after load
      this.checkPerformanceHealth();
    });
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    if (!('memory' in performance)) {
      console.warn('[Performance] Memory monitoring not available');
      return;
    }

    this.memoryInterval = setInterval(() => {
      const memory = performance.memory;
      const stats = {
        timestamp: Date.now(),
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };

      this.memoryStats.push(stats);

      // Keep only last 100 entries
      if (this.memoryStats.length > 100) {
        this.memoryStats.shift();
      }

      // Warn if memory usage is high
      const usagePercent = (stats.used / stats.limit) * 100;
      if (usagePercent > 80) {
        console.warn('[Performance] High memory usage:', usagePercent.toFixed(1) + '%');
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Start FPS monitoring
   */
  startFPSMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) { // Every second
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        this.fpsStats.push({
          timestamp: Date.now(),
          fps: fps
        });

        // Keep only last 60 entries (1 minute)
        if (this.fpsStats.length > 60) {
          this.fpsStats.shift();
        }

        // Warn if FPS is low
        if (fps < 30) {
          console.warn('[Performance] Low FPS detected:', fps);
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      if (this.isMonitoring) {
        requestAnimationFrame(measureFPS);
      }
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Set up general performance observer for long tasks
   */
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        this.observers.performance = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'longtask') {
              console.warn('[Performance] Long task detected:', entry.duration.toFixed(2) + 'ms');
            } else if (entry.entryType === 'measure') {
              console.log('[Performance] Custom measure:', entry.name, entry.duration.toFixed(2) + 'ms');
            }
          });
        });

        this.observers.performance.observe({
          entryTypes: ['longtask', 'measure']
        });
      } catch (error) {
        console.warn('[Performance] Performance observer setup failed:', error);
      }
    }
  }

  /**
   * Check overall performance health
   */
  checkPerformanceHealth() {
    const issues = [];

    // Check Core Web Vitals
    if (this.metrics.lcp && this.metrics.lcp.value > 2500) {
      issues.push('LCP is too slow (>2.5s)');
    }

    if (this.metrics.fid && this.metrics.fid.value > 100) {
      issues.push('FID is too high (>100ms)');
    }

    if (this.metrics.cls && this.metrics.cls.value > 0.1) {
      issues.push('CLS is too high (>0.1)');
    }

    // Check memory usage
    if (this.memoryStats.length > 0) {
      const latestMemory = this.memoryStats[this.memoryStats.length - 1];
      const usagePercent = (latestMemory.used / latestMemory.limit) * 100;
      if (usagePercent > 90) {
        issues.push('Memory usage is critically high (>90%)');
      }
    }

    // Check FPS
    if (this.fpsStats.length > 0) {
      const recentFPS = this.fpsStats.slice(-10); // Last 10 seconds
      const avgFPS = recentFPS.reduce((sum, stat) => sum + stat.fps, 0) / recentFPS.length;
      if (avgFPS < 50) {
        issues.push('Average FPS is low (<50)');
      }
    }

    if (issues.length > 0) {
      console.warn('[Performance] Performance issues detected:', issues);
      this.reportPerformanceIssues(issues);
    } else {
      console.log('[Performance] Performance health check passed');
    }
  }

  /**
   * Report performance issues
   * @param {Array} issues - List of performance issues
   */
  reportPerformanceIssues(issues) {
    // Send to analytics or logging service
    if (window.gtag) {
      window.gtag('event', 'performance_issue', {
        event_category: 'performance',
        event_label: issues.join('; '),
        value: issues.length
      });
    }

    // Also show a subtle notification to the user
    // if (issues.length > 0 && window.Toastify) {
    //   Toastify({
    //     text: "Performance optimization suggestions available. Check console for details.",
    //     duration: 5000,
    //     gravity: "bottom",
    //     position: "left",
    //     backgroundColor: "#f59e0b"
    //   }).showToast();
    // }
  }

  /**
   * Get current performance metrics
   * @returns {Object} - Performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      memoryStats: this.memoryStats,
      fpsStats: this.fpsStats,
      uptime: this.startTime ? performance.now() - this.startTime : 0
    };
  }

  /**
   * Get performance recommendations
   * @returns {Array} - List of recommendations
   */
  getRecommendations() {
    const recommendations = [];

    if (this.metrics.lcp && this.metrics.lcp.value > 2500) {
      recommendations.push('Optimize Largest Contentful Paint by improving image loading and reducing render-blocking resources');
    }

    if (this.metrics.fid && this.metrics.fid.value > 100) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time and improving interactivity');
    }

    if (this.metrics.cls && this.metrics.cls.value > 0.1) {
      recommendations.push('Fix Cumulative Layout Shift by reserving space for dynamic content and avoiding layout changes');
    }

    if (this.memoryStats.length > 0) {
      const latestMemory = this.memoryStats[this.memoryStats.length - 1];
      const usagePercent = (latestMemory.used / latestMemory.limit) * 100;
      if (usagePercent > 80) {
        recommendations.push('High memory usage detected. Consider implementing lazy loading and cleaning up unused resources');
      }
    }

    if (this.fpsStats.length > 0) {
      const recentFPS = this.fpsStats.slice(-10);
      const avgFPS = recentFPS.reduce((sum, stat) => sum + stat.fps, 0) / recentFPS.length;
      if (avgFPS < 50) {
        recommendations.push('Low frame rate detected. Optimize animations and reduce DOM manipulations');
      }
    }

    return recommendations;
  }

  /**
   * Export performance data
   * @returns {Object} - Complete performance report
   */
  exportReport() {
    return {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: this.getMetrics(),
      recommendations: this.getRecommendations(),
      performanceSupport: {
        webVitals: 'PerformanceObserver' in window,
        memory: 'memory' in performance,
        timing: 'timing' in performance
      }
    };
  }
}

// Create global instance
const performanceMonitor = new PerformanceMonitor();

// Make available globally
window.performanceMonitor = performanceMonitor;

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  performanceMonitor.initialize();
});

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceMonitor;
}
