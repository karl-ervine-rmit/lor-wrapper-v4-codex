/**
 * SuperSplat Content Plugin
 * Integration with PlayCanvas SuperSplat viewer for Gaussian Splatting visualization
 * https://github.com/playcanvas/supersplat-viewer
 */

export const superSplatPlugin = {
  /**
   * Load and initialize SuperSplat viewer
   * @param {Object} wrapper - The wrapper instance
   * @param {Object} config - Configuration object
   * @param {string} config.src - SuperSplat .ply file URL (required)
   * @param {string} [config.settings] - URL to settings.json (optional)
   * @param {string} [config.poster] - URL to poster image (optional)
   * @param {string} [config.skybox] - URL to skybox image (optional)
   * @param {boolean} [config.showUI=true] - Show UI controls
   * @param {boolean} [config.autoPlay=true] - Auto-play animations
   * @param {boolean} [config.showStats=false] - Show performance stats
   * @param {string} [config.title] - Title for accessibility
   * @param {string} [config.alt] - Alt text for accessibility
   */
  async load(wrapper, {
    src,
    settings,
    poster,
    skybox,
    showUI = true,
    autoPlay = true,
    showStats = false,
    title = '',
    alt = '3D Gaussian Splatting visualization'
  }) {
    console.log('🚀 Loading SuperSplat visualization:', src);
    const container = wrapper.getContentContainer();
    
    // Create container for the viewer
    const viewerContainer = document.createElement('div');
    viewerContainer.className = 'supersplat-container';
    viewerContainer.style.width = '100%';
    viewerContainer.style.height = '100%';
    viewerContainer.style.position = 'relative';
    
    // Create iframe for SuperSplat viewer
    const iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.setAttribute('allow', 'xr-spatial-tracking');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('title', title || alt);
    
    // Check if we're loading a local file
    let finalSrc = src;
    const isLocalFile = !src.startsWith('http') && !src.startsWith('//');
    
    if (isLocalFile) {
      // For local files, convert to absolute URL if it's a relative path
      if (src.startsWith('/')) {
        // Already an absolute path
        finalSrc = window.location.origin + src;
      } else {
        // Relative path, make it absolute
        const basePath = window.location.pathname.split('/').slice(0, -1).join('/');
        finalSrc = window.location.origin + (basePath ? basePath + '/' : '') + src;
      }
      console.log('Using local file URL:', finalSrc);
    }
    // Use locally hosted SuperSplat viewer with our file URL
    const url = new URL('supersplat-viewer/index.html', window.location.href);
    url.searchParams.append('content', finalSrc);
    
    if (settings) url.searchParams.append('settings', settings);
    if (poster) url.searchParams.append('poster', poster);
    if (skybox) url.searchParams.append('skybox', skybox);
    if (!showUI) url.searchParams.append('noui', '');
    if (!autoPlay) url.searchParams.append('noanim', '');
    if (showStats) url.searchParams.append('ministats', '');
    
    iframe.src = url.toString();
    
    // Add loading indicator
    const loading = document.createElement('div');
    loading.className = 'loading-indicator';
    loading.style.position = 'absolute';
    loading.style.top = '50%';
    loading.style.left = '50%';
    loading.style.transform = 'translate(-50%, -50%)';
    loading.style.padding = '1rem 2rem';
    loading.style.background = 'rgba(0, 0, 0, 0.7)';
    loading.style.color = 'white';
    loading.style.borderRadius = '4px';
    loading.textContent = 'Loading 3D visualization...';
    
    // Handle iframe load events
    iframe.onload = () => {
      loading.style.display = 'none';
      // Notify wrapper of content load
      if (wrapper.onContentLoaded) {
        wrapper.onContentLoaded();
      }
    };
    
    iframe.onerror = (error) => {
      console.error('❌ Failed to load SuperSplat viewer:', error);
      loading.textContent = 'Failed to load 3D visualization. Please try again.';
      loading.style.background = 'rgba(200, 50, 50, 0.8)';
      
      // Notify wrapper of error
      if (wrapper.onError) {
        wrapper.onError(new Error('Failed to load SuperSplat viewer'));
      }
    };
    
    // Assemble the viewer
    viewerContainer.appendChild(iframe);
    viewerContainer.appendChild(loading);
    container.appendChild(viewerContainer);
    
    // Cleanup function
    return () => {
      container.removeChild(viewerContainer);
    };
  }
};
