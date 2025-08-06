/**
 * Content Plugins - Modular system for handling different content types
 * Each plugin is now in a separate file for better maintainability
 */

export const contentPlugins = {
  /**
   * Dynamically load a content plugin based on type
   * @param {string} type - Content type identifier
   * @returns {Promise<Function>} Plugin load function
   */
  async getPlugin(type) {
    switch (type) {
      case 'video': {
        const { videoPlugin } = await import('./plugins/video/index.js');
        return videoPlugin.load;
      }
      case 'model': {
        const { modelPlugin } = await import('./plugins/model/index.js');
        return modelPlugin.load;
      }
      case 'pdf': {
        const { iframePlugin } = await import('./plugins/iframe/index.js');
        return iframePlugin.load;
      }
      case 'h5p': {
        const { h5pPlugin } = await import('./plugins/h5p/index.js');
        return h5pPlugin.load;
      }
      case 'supersplat': {
        const { superSplatPlugin } = await import('./plugins/supersplat/index.js');
        return superSplatPlugin.load;
      }
      case 'iframe':
      default: {
        const { iframePlugin } = await import('./plugins/iframe/index.js');
        return iframePlugin.load;
      }
    }
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
