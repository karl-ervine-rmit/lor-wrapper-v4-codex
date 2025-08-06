import logger from './utils/logger.js';

/**
 * Learning Object Wrapper - Vanilla JavaScript Version
 *
 * Universal wrapper for embedding different types of learning content
 * Supports: video, 3D models, PDFs, H5P, websites, auto-detection
 * Features: theming, iframe resize, transcript support, analytics ready
 */

class LearningObjectWrapper {
  constructor(container, config = {}) {
    this.container = container;
    this.config = {
      type: 'auto',
      title: '',
      showHeader: false,
      manifestUrl: null,
      theme: 'auto',
      backgroundColor: null,
      ...config
    };
    
    // State management
    this.state = {
      isReady: false,
      currentTheme: 'light',
      transcriptVisible: false,
      lastHeight: 0,
      lastWidth: 0,
      resizeTimer: null,
      mediaQuery: null
    };
    
    // Initialize wrapper
    this.initialize();
  }

  /**
   * Initialize the wrapper
   */
  async initialize() {
    try {
      logger.debug('🚀 Initializing wrapper...');
      
      // Create basic structure (this now includes theme detection)
      this.createWrapperStructure();
      logger.debug('✅ DOM structure created');
      
      // Set up theme change listeners (after DOM is created)
      this.setupThemeListener();
      logger.debug('✅ Theme listeners set up');
      
      // Initialize resize handling
      this.initializeResize();
      logger.debug('✅ Resize handling initialized');
      
      // Load manifest if provided
      if (this.config.manifestUrl) {
        logger.debug('📄 Loading manifest:', this.config.manifestUrl);
        await this.loadManifest();
      }
      
      // Mark as ready and dispatch event
      this.state.isReady = true;
      logger.debug('🎉 Dispatching wrapper:ready event');
      this.dispatchEvent('wrapper:ready', {
        wrapper: this,
        config: this.config,
        container: this.container
      });
      
    } catch (error) {
      logger.error('Error initializing wrapper:', error);
      this.showError(`Failed to initialize learning object wrapper: ${error.message}`);
    }
  }

  /**
   * Create the basic wrapper DOM structure
   */
  createWrapperStructure() {
    // Detect theme first
    this.state.currentTheme = this.detectTheme();
    
    this.container.innerHTML = `
      <div aria-live="polite" aria-atomic="true" class="lo-announcements" id="lo-announcements"></div>
      <div class="lo-wrapper theme-${this.state.currentTheme}" 
           data-object-id="${this.config.id || 'auto'}" 
           data-object-type="${this.config.type}">
        ${this.config.showHeader && this.config.title ? this.createHeader() : ''}
        <main class="lo-content" role="main">
          <div class="lo-content-inner">
            <!-- Content will be injected here -->
          </div>
        </main>
      </div>`;
  }

  /**
   * Create header HTML
   */
  createHeader() {
    return `
      <header class="lo-header" role="banner">
        <div class="lo-header-inner">
          <h1 class="lo-title">${this.config.title}</h1>
        </div>
      </header>`;
  }

  /**
   * Get the content container element
   */
  getContentContainer() {
    return this.container.querySelector('.lo-content-inner');
  }


  /**
   * Detect user's preferred theme
   */
  detectTheme() {
    // Check for forced theme in config
    if (this.config.theme && this.config.theme !== 'auto') {
      return this.config.theme;
    }

    // Check for high contrast mode
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      return 'high-contrast';
    }

    // Check for dark mode preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // Default to light theme
    return 'light';
  }

  /**
   * Apply theme to wrapper
   */
  applyTheme(theme) {
    const wrapper = this.container.querySelector('.lo-wrapper');
    if (wrapper) {
      // Remove existing theme classes
      wrapper.className = wrapper.className.replace(/theme-\w+/g, '');
      // Add new theme class
      wrapper.classList.add(`theme-${theme}`);
      
      this.state.currentTheme = theme;
      
      // Apply custom background color if configured
      if (this.config.backgroundColor) {
        wrapper.style.backgroundColor = this.config.backgroundColor;
      }
      
      // Dispatch theme change event
      this.dispatchEvent('theme:change', {
        theme: theme,
        isSystemTheme: this.config.theme === 'auto'
      });
    }
  }

  /**
   * Setup theme change listeners
   */
  setupThemeListener() {
    if (this.config.theme === 'auto') {
      this.state.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.state.mediaQuery.addEventListener('change', (e) => {
        const newTheme = e.matches ? 'dark' : 'light';
        if (newTheme !== this.state.currentTheme) {
          this.applyTheme(newTheme);
        }
      });
    }
  }

  /**
   * Initialize iframe resize functionality
   */
  initializeResize() {
    // Only run if we're in an iframe
    if (window.parent === window) return;

    // Send initial height
    this.sendResizeMessage();

    // Set up listeners (enhanced from IframeResizeManager)
    window.addEventListener('load', () => this.sendResizeMessage());
    window.addEventListener('resize', () => this.debouncedResize());

    // Use ResizeObserver on document.body for more reliable width change detection
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => this.debouncedResize());
      resizeObserver.observe(document.body);
    }

    // Also check for width changes periodically (fallback)
    setInterval(() => {
      const currentWidth = window.innerWidth;
      if (currentWidth !== this.state.lastWidth) {
        this.debouncedResize();
      }
    }, 500);

    // Watch for DOM changes (modern browsers)
    if (window.MutationObserver) {
      const observer = new MutationObserver(() => this.debouncedResize());
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
    }

    // Watch for image loads (can change height)
    document.addEventListener('load', () => this.sendResizeMessage(), true);
    
    // Enhanced checking for dynamic content like H5P
    this.setupDynamicContentWatcher();
  }

  /**
   * Get accurate content height (enhanced version from IframeResizeManager)
   */
  getContentHeight() {
    // First try to get the actual content container height
    const contentContainer = this.container.querySelector('.lo-wrapper');
    if (contentContainer) {
      const containerHeight = contentContainer.getBoundingClientRect().height;
      if (containerHeight > 0) {
        return Math.ceil(containerHeight);
      }
    }
    
    // Fallback to document measurements
    const bodyScrollHeight = document.body.scrollHeight;
    const bodyOffsetHeight = document.body.offsetHeight;
    const docOffsetHeight = document.documentElement.offsetHeight;
    
    // Use the minimum of the valid measurements to allow shrinking
    const validHeights = [bodyScrollHeight, bodyOffsetHeight, docOffsetHeight].filter(h => h > 0);
    
    if (validHeights.length > 0) {
      return Math.min(...validHeights);
    }
    
    return bodyScrollHeight || 400; // Fallback height
  }

  /**
   * Send resize message to parent frame (enhanced version)
   */
  sendResizeMessage() {
    if (window.parent === window) return;
    
    const height = this.getContentHeight();
    const width = window.innerWidth;
    
    // Send if height changed (>1px threshold) OR if width changed at all
    // Lower threshold to ensure iframe shrinks when content gets smaller
    if (Math.abs(height - this.state.lastHeight) > 1 || width !== this.state.lastWidth) {
      window.parent.postMessage({
        subject: 'lti.frameResize',
        height: height
      }, '*');
      
      // Update last values after sending
      this.state.lastHeight = height;
      this.state.lastWidth = width;
    }
  }

  /**
   * Debounced resize function
   */
  debouncedResize() {
    clearTimeout(this.state.resizeTimer);
    this.state.resizeTimer = setTimeout(() => {
      this.sendResizeMessage();
    }, 100);
  }

  /**
   * Trigger manual resize (useful after content loads)
   */
  triggerResize() {
    setTimeout(() => this.sendResizeMessage(), 100);
  }

  /**
   * Force resize (bypasses threshold check)
   */
  forceResize() {
    if (window.parent === window) return;
    
    // Force layout recalculation by briefly changing display
    const wrapper = this.container.querySelector('.lo-wrapper');
    if (wrapper) {
      const originalDisplay = wrapper.style.display;
      wrapper.style.display = 'none';
      // Force reflow
      wrapper.offsetHeight;
      wrapper.style.display = originalDisplay;
    }
    
    const height = this.getContentHeight();
    const width = window.innerWidth;
    
    logger.debug(`🔄 Force resize: ${height}px (was ${this.state.lastHeight}px)`);
    
    // Always send regardless of threshold
    window.parent.postMessage({
      subject: 'lti.frameResize',
      height: height
    }, '*');
    
    // Update last values after sending
    this.state.lastHeight = height;
    this.state.lastWidth = width;
  }

  /**
   * Set up enhanced watching for dynamic content (H5P, etc.)
   */
  setupDynamicContentWatcher() {
    // More frequent checking for the first 30 seconds (for slow-loading content)
    let checkCount = 0;
    const maxChecks = 60; // 30 seconds at 500ms intervals
    
    const dynamicChecker = setInterval(() => {
      this.sendResizeMessage();
      checkCount++;
      
      if (checkCount >= maxChecks) {
        clearInterval(dynamicChecker);
        logger.debug('🔄 Dynamic content checking completed');
      }
    }, 500);
    
    // Enhanced H5P detection and resize handling
    this.setupH5PResizeHandling();
    
    // Watch for iframe content changes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      iframe.addEventListener('load', () => {
        logger.debug('📄 Iframe content loaded, checking size');
        setTimeout(() => this.sendResizeMessage(), 100);
        setTimeout(() => this.sendResizeMessage(), 500);
        setTimeout(() => this.sendResizeMessage(), 1000);
        setTimeout(() => this.sendResizeMessage(), 2000);
      });
    });
  }

  /**
   * Enhanced H5P resize handling (simplified - relies on official H5P resizer)
   */
  setupH5PResizeHandling() {
    // Listen for H5P resize events (fallback if official resizer fails)
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;
      
      // Check for H5P resize messages (simplified detection)
      const isH5PResize = (
        data.type === 'h5p' ||
        data.action === 'resize' ||
        (data.context && data.context === 'h5p') ||
        (data.subject && data.subject.includes('h5p'))
      );
      
      if (isH5PResize) {
        logger.debug('📏 H5P resize event detected (fallback handling):', data);
        this.debouncedResize();
      }
    });
    
    // Light monitoring for H5P content (official resizer should handle most cases)
    const isH5PContent = window.location.href.includes('h5p') || 
                        document.querySelector('iframe[src*="h5p"]') ||
                        document.querySelector('.h5p-content');
    
    if (isH5PContent) {
      logger.debug('🎮 H5P content detected - official H5P resizer should handle resize');
      
      // Lighter checking as fallback (official resizer should handle primary resizing)
      let fallbackCount = 0;
      const fallbackMax = 30; // 15 seconds at 500ms intervals
      
      const fallbackChecker = setInterval(() => {
        this.sendResizeMessage();
        fallbackCount++;
        
        if (fallbackCount >= fallbackMax) {
          clearInterval(fallbackChecker);
          logger.debug('🔄 H5P fallback checking completed');
        }
      }, 500);
    }
  }

  /**
   * Load manifest configuration
   */
  async loadManifest() {
    try {
      const response = await fetch(this.config.manifestUrl);
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.statusText}`);
      }
      
      const manifest = await response.json();
      
      // Update config with manifest values
      const hadTitle = !!this.config.title;
      this.config.title = this.config.title || manifest.title;
      this.config.type = this.config.type === 'auto' ? manifest.type : this.config.type;
      
      // If we got a title from manifest and showHeader is true, update the header
      if (manifest.title && this.config.showHeader && !hadTitle) {
        this.updateHeaderAfterManifest();
      } else if (manifest.title && this.config.showHeader && hadTitle) {
        this.updateTitle(this.config.title);
      }
      
      // Handle transcripts
      if (manifest.transcripts) {
        this.config.transcripts = manifest.transcripts;
        logger.debug('📝 Transcripts found in manifest:', manifest.transcripts);
        
        // Create transcript UI after loading manifest
        this.createTranscriptUI();
      }
      
      // Handle attribution
      if (manifest.attribution) {
        this.config.attribution = manifest.attribution;
        logger.debug('📄 Attribution found in manifest:', manifest.attribution);
        
        // Create attribution footer after loading manifest
        this.createAttributionFooter();
      }
      
    } catch (error) {
      logger.warn('Failed to load manifest:', error);
    }
  }

  /**
   * Update wrapper title
   */
  updateTitle(newTitle) {
    this.config.title = newTitle;
    const titleElement = this.container.querySelector('.lo-title');
    if (titleElement) {
      titleElement.textContent = newTitle;
    }
  }

  /**
   * Update header after manifest loads (when no initial title was provided)
   */
  updateHeaderAfterManifest() {
    if (!this.config.title || !this.config.showHeader) return;
    
    const wrapperElement = this.container.querySelector('.lo-wrapper');
    const contentElement = wrapperElement.querySelector('.lo-content');
    
    if (wrapperElement && contentElement) {
      // Insert header before content
      const headerHTML = this.createHeader();
      contentElement.insertAdjacentHTML('beforebegin', headerHTML);
      logger.debug('✅ Header added after manifest load');
    }
  }


  /**
   * Show error message with retry option
   */
  showError(message, retryCallback = null) {
    const contentContainer = this.getContentContainer();
    if (contentContainer) {
      const retryButton = retryCallback ? `
        <button class="lo-error-retry" onclick="this.disabled=true; (${retryCallback.toString()})()">
          Try Again
        </button>
      ` : '';
      
      contentContainer.innerHTML = `
        <div class="lo-error" role="alert">
          <div class="lo-error-title">Error</div>
          <div class="lo-error-message">${this.escapeHtml(message)}</div>
          ${retryButton}
        </div>`;
      
    }
  }

  /**
   * Show loading state
   */
  showLoading(message = 'Loading content...') {
    const contentContainer = this.getContentContainer();
    if (contentContainer) {
      contentContainer.innerHTML = `
        <div class="lo-loading" role="status" aria-live="polite">
          <div class="lo-loading-spinner" aria-hidden="true"></div>
          <div class="lo-loading-text">${this.escapeHtml(message)}</div>
        </div>`;
      
    }
  }

  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message) {
    const announcements = this.container.querySelector('#lo-announcements');
    if (announcements) {
      announcements.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        announcements.textContent = '';
      }, 1000);
    }
  }

  /**
   * Dispatch custom event
   */
  dispatchEvent(eventName, detail) {
    const event = new CustomEvent(eventName, {
      detail: detail,
      bubbles: true,
      composed: true
    });
    
    if (this.container) {
      this.container.dispatchEvent(event);
    }
    document.dispatchEvent(event);
  }

  /**
   * Track content events (placeholder for analytics)
   */
  trackContentEvent(action, category, label) {
    logger.debug('Analytics Event:', { action, category, label });
    
    // Dispatch analytics event for external tracking
    this.dispatchEvent('analytics:track', {
      action: action,
      category: category,
      label: label,
      timestamp: Date.now()
    });
  }

  /**
   * Create transcript UI elements (based on original TranscriptManager)
   */
  createTranscriptUI() {
    logger.debug('📝 Creating transcript UI');
    
    if (!this.config.transcripts || this.config.transcripts.length === 0) {
      logger.debug('No transcripts available, skipping UI creation');
      return;
    }

    const wrapperElement = this.container.querySelector('.lo-wrapper');
    if (!wrapperElement) return;

    const transcriptSection = document.createElement('section');
    transcriptSection.className = 'lo-transcript';
    transcriptSection.setAttribute('aria-label', 'Transcript');
    
    const languageOptions = this.config.transcripts.length > 1 ? 
      this.createLanguageSelector() : '';
    
    transcriptSection.innerHTML = `
      <div class="lo-transcript-controls">
        ${languageOptions}
        <button class="lo-transcript-toggle" 
                aria-expanded="false"
                aria-describedby="transcript-description"
                aria-controls="transcript-content">
          <span class="lo-transcript-label">Show Transcript</span>
        </button>
      </div>
      <div id="transcript-description" class="sr-only">
        Toggle visibility of content transcript
      </div>
      <div class="lo-transcript-content" 
           id="transcript-content"
           aria-hidden="true"
           aria-labelledby="transcript-heading">
        <h3 id="transcript-heading" class="sr-only">Content Transcript</h3>
        <div class="lo-transcript-text" role="article">
          <!-- Transcript loads here -->
        </div>
      </div>
    `;

    wrapperElement.appendChild(transcriptSection);
    logger.debug('✅ Transcript UI created');
    
    this.attachTranscriptEventListeners();
    this.loadDefaultTranscript();
  }

  /**
   * Create language selector dropdown
   */
  createLanguageSelector() {
    const options = this.config.transcripts.map(transcript =>
      `<option value="${transcript.language}" ${transcript.default ? 'selected' : ''}>${this.getLanguageLabel(transcript.language)}</option>`
    ).join('');

    return `
      <div class="lo-transcript-languages">
        <label for="transcript-lang-select" class="sr-only">Select transcript language:</label>
        <select id="transcript-lang-select" 
                class="lo-transcript-lang-select"
                aria-label="Select transcript language">
          ${options}
        </select>
      </div>
    `;
  }

  /**
   * Attach event listeners for transcript interactions
   */
  attachTranscriptEventListeners() {
    const transcriptSection = this.container.querySelector('.lo-transcript');
    if (!transcriptSection) return;

    const toggleButton = transcriptSection.querySelector('.lo-transcript-toggle');
    const languageSelect = transcriptSection.querySelector('#transcript-lang-select');

    if (toggleButton) {
      // Mouse events
      toggleButton.addEventListener('click', () => this.toggleTranscript());
      
      // Keyboard events
      toggleButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTranscript();
        }
      });
      
      logger.debug('✅ Transcript toggle event listeners attached');
    }

    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        logger.debug('Language changed to:', e.target.value);
        this.loadTranscript(e.target.value);
      });
      
      // Keyboard navigation for select
      languageSelect.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.target.blur(); // Commit selection
        }
      });
      
      logger.debug('✅ Language selector event listeners attached');
    }
  }

  /**
   * Toggle transcript visibility
   */
  toggleTranscript() {
    this.state.transcriptVisible = !this.state.transcriptVisible;

    const transcriptSection = this.container.querySelector('.lo-transcript');
    if (!transcriptSection) return;

    const content = transcriptSection.querySelector('.lo-transcript-content');
    const toggle = transcriptSection.querySelector('.lo-transcript-toggle');
    const label = transcriptSection.querySelector('.lo-transcript-label');

    if (this.state.transcriptVisible) {
      content?.setAttribute('aria-hidden', 'false');
      toggle?.setAttribute('aria-expanded', 'true');
      if (label) label.textContent = 'Hide Transcript';
      
      this.trackContentEvent('transcript_show', 'Transcript', 'toggle');
    } else {
      content?.setAttribute('aria-hidden', 'true');
      toggle?.setAttribute('aria-expanded', 'false');
      if (label) label.textContent = 'Show Transcript';
      
      this.trackContentEvent('transcript_hide', 'Transcript', 'toggle');
    }

    // Trigger resize after transcript toggle
    this.triggerResize();
  }

  /**
   * Load default transcript
   */
  async loadDefaultTranscript() {
    const defaultTranscript = this.config.transcripts.find(t => t.default) || this.config.transcripts[0];
    if (defaultTranscript) {
      await this.loadTranscript(defaultTranscript.language);
    }
  }

  /**
   * Load transcript content for a specific language
   */
  async loadTranscript(language) {
    logger.debug('📝 Loading transcript for language:', language);

    const transcript = this.config.transcripts.find(t => t.language === language);
    if (!transcript) {
      logger.warn(`Transcript not found for language: ${language}`);
      return;
    }

    try {
      logger.debug('Fetching transcript from:', transcript.url);
      const response = await fetch(transcript.url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const content = await response.text();
      logger.debug('✅ Transcript loaded, length:', content.length);

      this.updateTranscriptDisplay(content);
      
    } catch (error) {
      logger.error('❌ Transcript load error:', error);
      this.showTranscriptError();
    }
  }

  /**
   * Update transcript display with content
   */
  updateTranscriptDisplay(content) {
    const textElement = this.container.querySelector('.lo-transcript-text');
    if (textElement && content) {
      textElement.textContent = content;
      logger.debug('✅ Updated transcript display');
    }
  }

  /**
   * Show transcript error
   */
  showTranscriptError() {
    const textElement = this.container.querySelector('.lo-transcript-text');
    if (textElement) {
      textElement.innerHTML = `
        <div class="lo-transcript-error">
          <p>⚠️ Transcript unavailable</p>
          <p>Unable to load transcript content.</p>
        </div>`;
    }
  }

  /**
   * Get language label for language code
   */
  getLanguageLabel(langCode) {
    const labels = {
      'en': 'English',
      'es': 'Español', 
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português'
    };
    return labels[langCode] || langCode.toUpperCase();
  }

  /**
   * Create attribution footer (based on original implementation)
   */
  createAttributionFooter() {
    logger.debug('📄 Creating attribution footer');
    
    if (!this.config.attribution) {
      logger.debug('No attribution data, skipping footer creation');
      return;
    }

    const wrapperElement = this.container.querySelector('.lo-wrapper');
    if (!wrapperElement) return;

    const attribution = this.config.attribution;
    const { title, author, license } = attribution;

    // Don't render if no attribution data
    if (!title && !author && !license) return;

    const createLink = (data) => {
      if (!data || !data.text) return '';
      
      return data.url ? 
        `<a href="${data.url}" class="lo-attribution-link" target="_blank" rel="noopener">${this.escapeHtml(data.text)}</a>` :
        `<span class="lo-attribution-text">${this.escapeHtml(data.text)}</span>`;
    };

    // Build attribution in format: "Title" by Author is licensed under License
    let attributionText = '';
    
    if (title && title.text) {
      attributionText += `"${createLink(title)}"`;
    }
    
    // Only add "by Author" if author exists
    if (author && author.text) {
      attributionText += ` by ${createLink(author)}`;
    }
    
    if (license && license.text) {
      // Only add "is licensed under" if we have title or author, otherwise just show license
      const hasContent = (title && title.text) || (author && author.text);
      attributionText += hasContent ? ` is licensed under ${createLink(license)}` : createLink(license);
    }

    const attributionHTML = `
      <footer class="lo-attribution" role="contentinfo">
        <div class="lo-attribution-content">
          ${attributionText}
        </div>
      </footer>
    `;

    wrapperElement.insertAdjacentHTML('beforeend', attributionHTML);
    logger.debug('✅ Attribution footer created');
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Cleanup wrapper (remove event listeners, etc.)
   */
  destroy() {
    // Clean up theme listener
    if (this.state.mediaQuery) {
      this.state.mediaQuery.removeEventListener('change', this.handleThemeChange);
    }
    
    // Clear timers
    if (this.state.resizeTimer) {
      clearTimeout(this.state.resizeTimer);
    }
    
    // Mark as not ready
    this.state.isReady = false;
  }
}

export default LearningObjectWrapper;

if (typeof window !== 'undefined') {
  window.LearningObjectWrapper = LearningObjectWrapper;
}