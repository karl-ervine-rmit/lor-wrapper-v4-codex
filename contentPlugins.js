/**
 * Content Plugins - Modular system for handling different content types
 * Each plugin is now in a separate file for better maintainability
 */

const pluginLoaders = {
  video: () => import('./plugins/video/index.js').then(m => m.videoPlugin.load),
  model: () => import('./plugins/model/index.js').then(m => m.modelPlugin.load),
  pdf: () => import('./plugins/iframe/index.js').then(m => m.iframePlugin.load),
  h5p: () => import('./plugins/h5p/index.js').then(m => m.h5pPlugin.load),
  supersplat: () => import('./plugins/supersplat/index.js').then(m => m.superSplatPlugin.load),
  iframe: () => import('./plugins/iframe/index.js').then(m => m.iframePlugin.load)
};

export const contentPlugins = {
  /**
   * Dynamically load a content plugin based on type
   * @param {string} type - Content type identifier
   * @returns {Promise<Function>} Plugin load function
   */
  async getPlugin(type) {
    const loader = pluginLoaders[type] || pluginLoaders.iframe;
    return loader();
  },

  /**
   * Auto-detect content type based on URL or extension
   * @param {string} src - The source URL
   * @returns {string} Detected content type
   */
  detectType: (src) => {
    if (!src) return 'iframe';
    
    try {
      const url = new URL(src, window.location.href);
      const ext = src.split('.').pop().toLowerCase();
      
      // Video detection
      if (url.hostname.includes('youtube.com') || 
          url.hostname.includes('vimeo.com') ||
          ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext)) {
        return 'video';
      }
      
      // 3D model detection
      if (['glb', 'gltf', 'obj', 'fbx', '3ds'].includes(ext)) {
        return 'model';
      }

      // SuperSplat detection (.ply)
      if (ext === 'ply') {
        return 'supersplat';
      }
      
      // PDF detection
      if (ext === 'pdf') {
        return 'pdf';
      }
      
      // H5P detection
      if (url.hostname.includes('h5p.org') || 
          src.includes('/h5p/') ||
          src.includes('h5p')) {
        return 'h5p';
      }
      
      // Default to iframe
      return 'iframe';
      
    } catch (error) {
      console.warn('Error detecting content type:', error);
      return 'iframe';
    }
  }
};
