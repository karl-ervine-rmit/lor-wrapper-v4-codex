/**
 * Content Plugins - Modular system for handling different content types
 * Each plugin is now in a separate file for better maintainability
 */

import { videoPlugin } from './plugins/videoPlugin.js';
import { modelPlugin } from './plugins/modelPlugin.js';
import { iframePlugin } from './plugins/iframePlugin.js';
import { h5pPlugin } from './plugins/h5pPlugin.js';
import { superSplatPlugin } from './plugins/superSplatPlugin.js';

export const contentPlugins = {
  /**
   * Video content handler
   */
  video: videoPlugin.load,

  /**
   * 3D model content handler  
   */
  model: modelPlugin.load,

  /**
   * PDF content handler (uses iframe plugin)
   */
  pdf: iframePlugin.load,

  /**
   * H5P content handler (dedicated plugin with official resizer)
   */
  h5p: h5pPlugin.load,

  /**
   * Gaussian splat (.ply) content handler using PlayCanvas SuperSplat viewer
   */
  supersplat: superSplatPlugin.load,

  /**
   * Generic iframe content handler
   */
  iframe: iframePlugin.load,

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
      
      // PDF detection
      if (ext === 'pdf') {
        return 'pdf';
      }

      // Gaussian splat detection (.ply files)
      if (ext === 'ply') {
        return 'supersplat';
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