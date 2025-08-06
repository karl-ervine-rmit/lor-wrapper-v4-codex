/**
 * H5P Content Plugin
 * Dedicated plugin for H5P interactive content with official resizer
 */

export const h5pPlugin = {
  /**
   * Handle H5P content with official resizer integration
   * @param {Object} wrapper - The wrapper instance
   * @param {Object} config - Configuration object
   * @param {string} config.src - H5P content source URL
   * @param {string} [config.title] - Optional title for the content
   */
  async load(wrapper, { src, title = '' }) {
    console.log('🎮 Loading H5P content:', src);
    const container = wrapper.getContentContainer();
    
    // Load H5P official resizer script first
    await loadH5PResizer();
    
    // Add H5P class to container
    container.classList.add('h5p-content');
    
    // Create H5P iframe with proper attributes
    container.innerHTML = `
      <div class="h5p-wrapper">
        <iframe 
          src="${src}" 
          width="100%" 
          height="600" 
          style="border: none; width: 100%; height: 100%;"
          title="${title || 'H5P Interactive Content'}"
          allowfullscreen 
          allow="geolocation *; microphone *; camera *; midi *; encrypted-media *">
          <p>Your browser does not support iframes. <a href="${src}" target="_blank">View H5P content directly</a>.</p>
        </iframe>
      </div>`;

    // Track H5P events
    const iframe = container.querySelector('iframe');
    
    iframe.addEventListener('load', () => {
      console.log('✅ H5P content loaded');
      wrapper.trackContentEvent('h5p_loaded', 'H5P Content', 'H5P interactive content loaded');
      wrapper.triggerResize();
    });

    iframe.addEventListener('error', () => {
      console.error('❌ H5P loading error');
      wrapper.trackContentEvent('h5p_error', 'H5P Content', 'H5P content failed to load');
    });

    // Set up H5P-specific message listening for analytics
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data) return;
      
      // Track H5P interactions
      if (data.type === 'h5p' && data.action) {
        wrapper.trackContentEvent(`h5p_${data.action}`, 'H5P Interaction', data.action);
      }
    });

    console.log('✅ H5P plugin initialized');
    return iframe;
  }
};

/**
 * Load H5P official resizer script for proper iframe resizing
 */
async function loadH5PResizer() {
  // Check if H5P resizer is already loaded
  if (window.H5PResizer || document.querySelector('script[src*="canvas-resizer"]')) {
    console.log('✅ H5P resizer already loaded');
    return;
  }

  console.log('📐 Loading H5P official resizer script...');
  
  try {
    const script = document.createElement('script');
    script.src = 'https://h5p.com/canvas-resizer.js';
    script.async = true;
    
    // Wait for script to load
    await new Promise((resolve, reject) => {
      script.onload = () => {
        console.log('✅ H5P resizer script loaded successfully');
        resolve();
      };
      
      script.onerror = () => {
        console.warn('⚠️ Failed to load H5P resizer script from CDN');
        reject(new Error('H5P resizer script failed to load'));
      };
      
      document.head.appendChild(script);
    });
    
  } catch (error) {
    console.warn('⚠️ H5P resizer not available, falling back to custom resize handling');
    // Don't throw - let the wrapper's custom resize handling work as fallback
  }
}