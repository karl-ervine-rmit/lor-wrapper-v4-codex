import '@google/model-viewer';
import './style.css';

/**
 * 3D Model Content Plugin
 * Enhanced model-viewer integration with controls and AR support
 */

export const modelPlugin = {
  /**
   * Handle 3D model content with enhanced model-viewer
   * @param {Object} wrapper - The wrapper instance
   * @param {Object} config - Configuration object
   * @param {string} config.src - 3D model source URL
   * @param {string} [config.iosSrc] - iOS USDZ model source URL for AR
   * @param {string} [config.title] - Optional title for the model
   * @param {string} [config.alt] - Alt text for accessibility
   */
  async load(wrapper, { src, iosSrc, title = '', alt = '3D model' }) {
    console.log('🚀 Loading 3D model:', src);
    const container = wrapper.getContentContainer();
    
    // Ensure model-viewer custom element is defined
    await customElements.whenDefined('model-viewer');
    
    // Create unique model ID
    const modelId = 'model-' + Math.random().toString(36).substr(2, 9);
    console.log('Creating model with ID:', modelId);
    
    // Create elements programmatically to avoid innerHTML parsing issues
    const modelContainer = document.createElement('div');
    modelContainer.className = 'model-container';
    
    const modelViewer = document.createElement('model-viewer');
    modelViewer.id = modelId;
    modelViewer.src = src;
    modelViewer.alt = alt;
    
    // Set model-viewer attributes
    const attributes = {
      'camera-controls': '',
      'auto-rotate': '',
      'auto-rotate-delay': '0',
      'camera-orbit': '0deg 75deg 100%',
      'min-camera-orbit': 'auto auto 50%',
      'max-camera-orbit': 'auto auto 200%',
      'field-of-view': '25deg',
      'min-field-of-view': '10deg',
      'max-field-of-view': '45deg',
      'interaction-prompt': 'auto',
      'loading': 'eager',
      'reveal': 'auto',
      'ar': '',
      'ar-modes': 'webxr scene-viewer quick-look',
      'camera-target': 'auto',
      'shadow-intensity': '1',
      'environment-image': 'neutral',
      'exposure': '1',
      'shadow-softness': '0',
      'ar-scale': 'fixed',
      'ar-placement': 'floor'
    };
    
    // Add iOS-specific USDZ source for enhanced AR experience
    if (iosSrc) {
      attributes['ios-src'] = iosSrc;
      console.log('🍎 iOS USDZ source added:', iosSrc);
    }
    
    for (const [attr, value] of Object.entries(attributes)) {
      modelViewer.setAttribute(attr, value);
    }
    
    // Add accessibility attributes
    modelViewer.setAttribute('aria-label', `3D model: ${alt || title || '3D interactive content'}`);
    modelViewer.setAttribute('aria-describedby', 'model-instructions');
    modelViewer.setAttribute('role', 'img');
    
    modelContainer.appendChild(modelViewer);
    
    // Create controls
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'model-controls';
    
    // Detect if device likely supports AR
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const arButtonText = isMobile ? 'View in AR' : 'View in AR (Mobile Only)';
    
    controlsDiv.innerHTML = `
      <div id="model-instructions" class="sr-only">
        Interactive 3D model. Use mouse to rotate and zoom. 
        Press Tab to access control buttons for resetting view, 
        enabling AR mode, and controlling rotation.
      </div>
      <button class="model-control-btn" 
              data-action="reset"
              aria-describedby="reset-description">
        Reset View
      </button>
      <div id="reset-description" class="sr-only">Reset camera to default position and zoom</div>
      
      <button class="model-control-btn" 
              data-action="ar"
              aria-describedby="ar-description">
        ${arButtonText}
      </button>
      <div id="ar-description" class="sr-only">
        ${isMobile ? 'Activate augmented reality mode to view model in your space' : 'AR mode available on mobile devices only'}
      </div>
      
      <button class="model-control-btn" 
              data-action="rotate"
              aria-describedby="rotate-description">
        <span class="rotate-text">Pause Rotation</span>
      </button>
      <div id="rotate-description" class="sr-only">Toggle automatic rotation of the 3D model</div>
    `;
    
    // Clear container and add new elements
    container.innerHTML = '';
    container.appendChild(modelContainer);
    container.appendChild(controlsDiv);
    
    // Wait a moment for DOM to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // The modelViewer variable should already exist since we created it
    console.log('✅ Model viewer element created:', modelViewer);
    
    // Verify it's still in the DOM
    const foundInDOM = container.querySelector(`#${modelId}`);
    console.log('Element found in DOM:', !!foundInDOM);
    
    if (!foundInDOM) {
      console.error('Model viewer element disappeared from DOM!');
      console.error('Available elements in container:', container.querySelectorAll('*'));
      // Don't replace content - let it try to work
    }
    
    console.log('✅ Model viewer element found:', modelViewer);

    // Set up model control event listeners
    const controlButtons = controlsDiv.querySelectorAll('.model-control-btn');
    controlButtons.forEach(button => {
      // Mouse events
      button.addEventListener('click', () => {
        handleModelAction(button);
      });
      
      // Keyboard events
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleModelAction(button);
        }
      });
    });
    
    function handleModelAction(button) {
      const action = button.getAttribute('data-action');
      
      // Get fresh reference to model viewer element
      const currentModelViewer = container.querySelector(`#${modelId}`);
      if (!currentModelViewer) {
        console.error('Model viewer element not found for action:', action);
        return;
      }
        
      switch (action) {
        case 'reset': {
          currentModelViewer.cameraOrbit = "0deg 75deg 100%";
          currentModelViewer.cameraTarget = "auto";
          wrapper.trackContentEvent('camera_reset', '3D Model', 'Camera reset');
          break;
        }

        case 'ar': {
          if (currentModelViewer.canActivateAR) {
            currentModelViewer.activateAR();
            wrapper.trackContentEvent('ar_activated', '3D Model', 'AR mode activated');
          } else {
            const message = isMobile
              ? 'AR is not available on this device. Make sure your browser supports WebXR.'
              : 'AR is only available on mobile devices. Please open this page on a mobile device with AR support.';
            alert(message);
            wrapper.trackContentEvent('ar_unavailable', '3D Model', 'AR not supported');
          }
          break;
        }

        case 'rotate': {
          console.log('🔄 Rotation button clicked');
          const isAutoRotating = currentModelViewer.hasAttribute('auto-rotate');
          const rotateText = button.querySelector('.rotate-text');

          console.log('Current auto-rotate state:', isAutoRotating);

          if (isAutoRotating) {
            // Stop rotation
            currentModelViewer.removeAttribute('auto-rotate');
            rotateText.textContent = 'Start Rotation';
            console.log('✅ Auto-rotation disabled');
            wrapper.trackContentEvent('auto_rotate_disabled', '3D Model', 'Auto-rotation disabled');
          } else {
            // Start rotation with immediate effect
            currentModelViewer.setAttribute('auto-rotate', '');
            currentModelViewer.setAttribute('auto-rotate-delay', '0');

            // Force restart rotation by briefly removing and re-adding
            setTimeout(() => {
              currentModelViewer.removeAttribute('auto-rotate');
              setTimeout(() => {
                currentModelViewer.setAttribute('auto-rotate', '');
                currentModelViewer.setAttribute('auto-rotate-delay', '0');
              }, 10);
            }, 10);

            rotateText.textContent = 'Pause Rotation';
            console.log('✅ Auto-rotation enabled with immediate restart');
            wrapper.trackContentEvent('auto_rotate_enabled', '3D Model', 'Auto-rotation enabled');
          }
          break;
        }
      }
    }

    // Set up event listeners
    modelViewer.addEventListener('load', () => {
      console.log('✅ 3D model loaded successfully');
      wrapper.trackContentEvent('model_loaded', '3D Model', 'Model loaded successfully');
      wrapper.triggerResize();
    });

    modelViewer.addEventListener('error', (event) => {
      console.error('❌ Model loading error:', event.detail);
      wrapper.trackContentEvent('model_error', '3D Model', 'Model failed to load');
    });
    

    modelViewer.addEventListener('camera-change', () => {
      wrapper.trackContentEvent('camera_change', '3D Model', 'Camera position changed');
    });

    modelViewer.addEventListener('ar-status', (event) => {
      if (event.detail.status === 'session-started') {
        wrapper.trackContentEvent('ar_started', '3D Model', 'AR session started');
      } else if (event.detail.status === 'session-ended') {
        wrapper.trackContentEvent('ar_ended', '3D Model', 'AR session ended');
      }
    });

    console.log('✅ 3D model plugin initialized');
    return modelViewer;
  }
};