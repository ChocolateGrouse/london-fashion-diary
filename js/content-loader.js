/**
 * Content Loader Module
 * Loads and manages content from content.json
 */

const ContentLoader = {
  data: null,
  loaded: false,

  /**
   * Initialize and load content
   */
  async init() {
    if (this.loaded) return this.data;

    try {
      const response = await fetch('/content.json');

      if (!response.ok) {
        throw new Error(`Failed to load content: ${response.status}`);
      }

      this.data = await response.json();
      this.loaded = true;

      // Cache for offline use
      this.cacheContent();

      return this.data;
    } catch (error) {
      console.error('Content load error:', error);

      // Try cached version
      const cached = this.getCachedContent();
      if (cached) {
        console.log('Using cached content');
        this.data = cached;
        return this.data;
      }

      this.showError();
      return null;
    }
  },

  /**
   * Cache content in localStorage
   */
  cacheContent() {
    try {
      localStorage.setItem('johnfashion_content', JSON.stringify(this.data));
      localStorage.setItem('johnfashion_cached_at', Date.now().toString());
    } catch (e) {
      // localStorage might be full or disabled
    }
  },

  /**
   * Get cached content
   */
  getCachedContent() {
    try {
      const cached = localStorage.getItem('johnfashion_content');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Show error state
   */
  showError() {
    const main = document.querySelector('main') || document.body;
    main.innerHTML = `
      <div style="text-align: center; padding: 4rem 2rem;">
        <h2 style="margin-bottom: 1rem;">Content Unavailable</h2>
        <p style="color: #666;">Please refresh the page or try again later.</p>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  },

  /**
   * Get site info
   */
  getSite() {
    return this.data?.site || null;
  },

  /**
   * Get all weeks
   */
  getAllWeeks() {
    return this.data?.weeks || [];
  },

  /**
   * Get published weeks only
   */
  getPublishedWeeks() {
    return this.getAllWeeks().filter(w => w.status === 'published');
  },

  /**
   * Get week by slug
   */
  getWeekBySlug(slug) {
    return this.getAllWeeks().find(w => w.slug === slug);
  },

  /**
   * Get week by number
   */
  getWeekByNumber(num) {
    return this.getAllWeeks().find(w => w.weekNumber === num);
  },

  /**
   * Get adjacent weeks for navigation
   */
  getAdjacentWeeks(currentWeekNumber) {
    const published = this.getPublishedWeeks();
    const currentIndex = published.findIndex(w => w.weekNumber === currentWeekNumber);

    return {
      prev: currentIndex > 0 ? published[currentIndex - 1] : null,
      next: currentIndex < published.length - 1 ? published[currentIndex + 1] : null
    };
  },

  /**
   * Get route config
   */
  getRouteConfig() {
    return this.data?.route || {};
  }
};

// Export for use in other scripts
window.ContentLoader = ContentLoader;
