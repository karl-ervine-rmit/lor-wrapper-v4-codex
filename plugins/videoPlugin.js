/**
 * Video Content Plugin
 * Handles video content with Plyr player integration
 */

export const videoPlugin = {
  /**
   * Handle video content with Plyr player
   * @param {Object} wrapper - The wrapper instance
   * @param {Object} config - Configuration object
   * @param {string} config.src - Video source URL
   * @param {string} [config.title] - Optional title for the video
   * @param {Array} [config.captions] - Optional captions array for HTML5 videos
   * @param {string} [config.poster] - Optional poster image URL for HTML5 videos
   */
  async load(wrapper, { src, title = '', captions = [], poster = '' }) {
    console.log('🎬 Loading video:', src);
    console.log('🎬 Video config received:', { src, title, captions, poster });
    
    if (!src) {
      throw new Error('Video source URL is required');
    }
    
    const container = wrapper.getContentContainer();
    
    // Add video-content class for styling
    container.classList.add('video-content');
    
    // Detect video type and create appropriate element
    const videoType = detectVideoType(src);
    console.log('🎬 Detected video type:', videoType);
    const videoId = 'video-' + Math.random().toString(36).substr(2, 9);
    
    let videoElement = '';
    
    if (videoType === 'youtube') {
      const videoIdMatch = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      const youtubeId = videoIdMatch ? videoIdMatch[1] : '';
      
      videoElement = `
        <div id="${videoId}" data-plyr-provider="youtube" data-plyr-embed-id="${youtubeId}"></div>
      `;
    } else if (videoType === 'vimeo') {
      const videoIdMatch = src.match(/(?:vimeo\.com\/)([0-9]+)/);
      const vimeoId = videoIdMatch ? videoIdMatch[1] : '';
      
      videoElement = `
        <div id="${videoId}" data-plyr-provider="vimeo" data-plyr-embed-id="${vimeoId}"></div>
      `;
    } else {
      // HTML5 video with captions
      const captionTracks = captions && captions.length > 0 ? 
        captions.map(caption => 
          `<track kind="captions" label="${caption.label || caption.language}" src="${caption.src}" srclang="${caption.language}"${caption.default ? ' default' : ''}>`
        ).join('\n          ') : '';
      
      videoElement = `
        <video id="${videoId}" playsinline controls data-plyr-provider="html5"${poster ? ` poster="${poster}"` : ''}>
          <source src="${src}" type="video/mp4">
          ${captionTracks}
          Your browser doesn't support HTML5 video.
        </video>
      `;
    }
    
    container.innerHTML = `
      <div class="video-wrapper">
        <div class="video-container">
          ${videoElement}
        </div>
      </div>`;

    try {
      // Load Plyr if not already available
      if (!window.Plyr) {
        console.log('Loading Plyr...');
        
        // Load Plyr CSS first
        if (!document.querySelector('link[href*="plyr.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
          document.head.appendChild(link);
          
          // Wait for CSS to load
          await new Promise((resolve) => {
            link.onload = resolve;
            link.onerror = resolve; // Continue even if CSS fails
          });
        }
        
        // Load Plyr JS
        const script = document.createElement('script');
        script.src = 'https://cdn.plyr.io/3.7.8/plyr.polyfilled.js';
        document.head.appendChild(script);
        
        // Wait for Plyr to load with timeout
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Plyr loading timeout');
            resolve(); // Continue without Plyr
          }, 5000);
          
          script.onload = () => {
            clearTimeout(timeout);
            console.log('Plyr loaded successfully');
            resolve();
          };
          
          script.onerror = () => {
            clearTimeout(timeout);
            console.error('Failed to load Plyr');
            resolve(); // Continue without Plyr
          };
        });
      }

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 200));

      // Initialize Plyr if available
      const videoElement = container.querySelector(`#${videoId}`);
      console.log('Video element found:', !!videoElement);
      console.log('Plyr available:', !!window.Plyr);
      
      if (videoElement && window.Plyr) {
        console.log('Initializing Plyr for video:', videoId);
        
        try {
          // Initialize with all controls available (Plyr will handle responsive behavior)
          let player = new Plyr(videoElement, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
            settings: ['captions', 'quality', 'speed'],
            speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
            // Let Plyr handle responsive controls internally
            responsive: true
          });
          
          // Add resize listener to trigger wrapper resize without recreating player
          let resizeTimer;
          
          const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
              console.log('🔄 Video resize detected, updating wrapper size:', window.innerWidth);
              
              // Just trigger wrapper resize - let Plyr handle its own responsive behavior
              wrapper.triggerResize();
              
              // Hide/show volume slider (not mute) and PiP based on screen size
              const volumeSlider = container.querySelector('.plyr__volume input[type="range"]');
              const pipButton = container.querySelector('[data-plyr="pip"]');
              const airplayButton = container.querySelector('[data-plyr="airplay"]');
              
              if (window.innerWidth <= 480) {
                // Mobile - hide volume slider but keep mute button and settings
                if (volumeSlider) volumeSlider.style.display = 'none';
                if (pipButton) pipButton.style.display = 'none';
                if (airplayButton) airplayButton.style.display = 'none';
              } else {
                // Desktop - show all controls
                if (volumeSlider) volumeSlider.style.display = '';
                if (pipButton) pipButton.style.display = '';
                if (airplayButton) airplayButton.style.display = '';
              }
              
              // Force a more aggressive resize notification
              setTimeout(() => {
                // Use forceResize to bypass threshold when controls change
                if (wrapper.forceResize) {
                  wrapper.forceResize();
                } else {
                  wrapper.triggerResize();
                }
              }, 100);
            }, 250);
          };
          
          window.addEventListener('resize', handleResize);
          
          // Apply initial responsive controls
          setTimeout(() => handleResize(), 100);

          // Function to attach event listeners to player
          const attachPlayerEvents = (playerInstance, wrapperInstance) => {
            playerInstance.on('ready', () => {
              console.log('✅ Plyr player ready');
              wrapperInstance.trackContentEvent('video_ready', 'Video Player', 'Plyr initialized');
              
              // Multiple resize attempts after ready
              setTimeout(() => wrapperInstance.triggerResize(), 100);
              setTimeout(() => wrapperInstance.triggerResize(), 500);
              setTimeout(() => wrapperInstance.triggerResize(), 1000);
            });

            playerInstance.on('play', () => {
              wrapperInstance.trackContentEvent('video_play', 'Video Player', 'Video started');
              setTimeout(() => wrapperInstance.triggerResize(), 100);
            });

            playerInstance.on('pause', () => {
              wrapperInstance.trackContentEvent('video_pause', 'Video Player', 'Video paused');
              setTimeout(() => wrapperInstance.triggerResize(), 100);
            });

            playerInstance.on('ended', () => {
              wrapperInstance.trackContentEvent('video_complete', 'Video Player', 'Video finished');
            });

            playerInstance.on('enterfullscreen', () => {
              setTimeout(() => {
                if (wrapperInstance.forceResize) {
                  wrapperInstance.forceResize();
                } else {
                  wrapperInstance.triggerResize();
                }
              }, 100);
            });

            playerInstance.on('exitfullscreen', () => {
              setTimeout(() => {
                if (wrapperInstance.forceResize) {
                  wrapperInstance.forceResize();
                } else {
                  wrapperInstance.triggerResize();
                }
              }, 100);
            });

            playerInstance.on('controlsshown', () => {
              setTimeout(() => {
                if (wrapperInstance.forceResize) {
                  wrapperInstance.forceResize();
                } else {
                  wrapperInstance.triggerResize();
                }
              }, 100);
            });

            playerInstance.on('controlshidden', () => {
              setTimeout(() => {
                if (wrapperInstance.forceResize) {
                  wrapperInstance.forceResize();
                } else {
                  wrapperInstance.triggerResize();
                }
              }, 100);
            });

            playerInstance.on('loadeddata', () => {
              setTimeout(() => wrapperInstance.triggerResize(), 100);
            });

            playerInstance.on('loadedmetadata', () => {
              setTimeout(() => wrapperInstance.triggerResize(), 100);
            });
          };

          // Attach initial event listeners
          attachPlayerEvents(player, wrapper);

          return player;
          
        } catch (plyrError) {
          console.error('Failed to initialize Plyr:', plyrError);
          console.log('Falling back to basic video controls');
        }
      } else {
        console.warn('Plyr not available, using basic video controls');
      }
    } catch (error) {
      console.error('Error loading Plyr:', error);
      console.log('Using basic video controls');
    }

    console.log('✅ Video plugin initialized');
  }
};

/**
 * Detect video type from URL
 * @param {string} src - Video source URL
 * @returns {string} Video type (youtube, vimeo, or html5)
 */
function detectVideoType(src) {
  if (!src || typeof src !== 'string') {
    console.warn('Invalid video source:', src);
    return 'html5';
  }
  
  if (src.includes('youtube.com') || src.includes('youtu.be')) {
    return 'youtube';
  }
  if (src.includes('vimeo.com')) {
    return 'vimeo';
  }
  return 'html5';
}