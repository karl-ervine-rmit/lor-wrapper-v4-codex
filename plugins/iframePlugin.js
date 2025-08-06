/**
 * Iframe Content Plugin
 * Handles iframe content including PDFs and websites (H5P has its own plugin)
 */

export const iframePlugin = {
  /**
   * Handle iframe content (for PDFs, websites, etc.)
   * @param {Object} wrapper - The wrapper instance
   * @param {Object} config - Configuration object
   * @param {string} config.src - Content source URL
   * @param {string} [config.type] - Content type hint
   * @param {string} [config.title] - Optional title
   */
  async load(wrapper, { src, type = '', title = '' }) {
    console.log('🌐 Loading iframe content:', src, 'type:', type);
    const container = wrapper.getContentContainer();
    
    const isPDF = type === 'pdf' || src.toLowerCase().endsWith('.pdf');
    
    let iframeSrc = src;
    let iframeAttributes = '';
    
    if (isPDF) {
      // Use Google Docs PDF viewer for better compatibility
      iframeSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(src)}&embedded=true`;
      iframeAttributes = 'allowfullscreen';
      container.classList.add('pdf-content');
    } else {
      // Generic iframe
      iframeAttributes = 'allowfullscreen allow="geolocation *; microphone *; camera *; midi *; encrypted-media *"';
      container.classList.add('iframe-content');
    }
    
    container.innerHTML = `
      <div class="iframe-wrapper">
        <iframe 
          src="${iframeSrc}" 
          width="100%" 
          height="600" 
          style="border: none; width: 100%; height: 100%;"
          title="${title || 'Embedded content'}"
          ${iframeAttributes}>
          <p>Your browser does not support iframes. <a href="${src}" target="_blank">View content directly</a>.</p>
        </iframe>
      </div>`;

    // Track iframe events
    const iframe = container.querySelector('iframe');
    
    iframe.addEventListener('load', () => {
      console.log('✅ Iframe content loaded');
      wrapper.trackContentEvent('iframe_loaded', 'Iframe Content', `${type || 'generic'} content loaded`);
      wrapper.triggerResize();
    });

    iframe.addEventListener('error', () => {
      console.error('❌ Iframe loading error');
      wrapper.trackContentEvent('iframe_error', 'Iframe Content', `${type || 'generic'} content failed to load`);
    });

    console.log('✅ Iframe plugin initialized');
    return iframe;
  }
};