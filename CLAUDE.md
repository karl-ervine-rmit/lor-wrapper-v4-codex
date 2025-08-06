# CLAUDE.md - Learning Object Wrapper v4

## Project Overview

The Learning Object Wrapper v4 is a universal, vanilla JavaScript solution for embedding and displaying various types of learning content including videos, 3D models, PDFs, H5P interactive content, and websites. This project represents a complete rewrite from the previous Lit-based version to pure vanilla JavaScript for better compatibility and performance.

---

## 🏗️ Architecture

### Core System
- **Main Class**: `LearningObjectWrapper` (wrapper.js) - Core vanilla JavaScript class
- **Plugin System**: Modular content type handlers in `/plugins/`
- **Styling**: Complete CSS system with theming (wrapper.css)
- **Entry Point**: Universal embed endpoint (embed.html)

### Plugin Architecture
```
plugins/
├── videoPlugin.js    - HTML5, YouTube, Vimeo with Plyr integration
├── modelPlugin.js    - 3D models via model-viewer with AR support
├── iframePlugin.js   - General iframe embedding
└── h5pPlugin.js      - H5P-specific handling with resize support
```

### Configuration System
- **URL Parameters**: Short-form parameters for direct configuration
- **Manifest Files**: JSON-based configuration with priority protection
- **Parameter Priority**: Manifest (src/type) > URL params > Manifest (other) > Defaults

---

## 📁 Project Structure

```
lor-wrapper-v4/
├── wrapper.js              # Core wrapper class
├── wrapper.css             # Complete styling system with theming
├── embed.html              # Universal embed endpoint
├── index.html              # Test suite and documentation
├── package.json            # Project metadata
├── meta.json              # Feature tracking
├── README.md              # User documentation
├── plugins/               # Content type plugins
│   ├── videoPlugin.js     # Video handling (HTML5, YouTube, Vimeo)
│   ├── modelPlugin.js     # 3D model viewer
│   ├── iframePlugin.js    # General iframe support
│   └── h5pPlugin.js       # H5P interactive content
└── assets/               # Sample content and configuration
    ├── manifests/        # Example manifest files
    ├── transcripts/      # Sample transcript files
    └── captions/         # WebVTT caption files
```

---

## 🚀 Key Features & Components

### Video System (videoPlugin.js)
- **Multi-platform Support**: HTML5, YouTube, Vimeo
- **Plyr Integration**: Modern video player with responsive controls
- **Responsive Controls**: Mobile-optimized (≤480px) vs desktop controls
- **Caption Support**: WebVTT format with multi-language support
- **Poster Images**: HTML5 video poster support
- **Dynamic Adaptation**: Controls update on screen resize

### 3D Model System (modelPlugin.js)
- **Model-viewer Integration**: Google's web component for 3D models
- **AR Support**: Mobile AR with device detection
- **Interactive Controls**: Camera reset, rotation toggle, AR activation
- **Responsive Layout**: Horizontal controls on mobile (≤480px)

### Responsive Design
- **Mobile Breakpoint**: 480px for video and model controls
- **Transcript Controls**: 450px breakpoint for stacking
- **Grid Layouts**: Responsive test suite with 1-3 column layouts

### Theming System
- **Auto Detection**: Respects `prefers-color-scheme`
- **Manual Override**: Configuration-based theme selection
- **CSS Variables**: Organized theme-independent and theme-specific variables
- **Smooth Transitions**: 0.3s ease transitions between themes

### Transcript & Caption System
- **Multi-language Support**: Language picker with proper labels
- **Accessibility**: Screen reader support, ARIA labels
- **Visual Reordering**: DOM vs visual order for optimal UX
- **Toggle Functionality**: Show/hide with state persistence

### Attribution System
- **Flexible Format**: "Title" by Author is licensed under License
- **Underlined Links**: Consistent link styling
- **Optional Components**: Title, author, license can be omitted
- **XSS Protection**: HTML escaping for safety

---

## 🔧 Technical Implementation

### Parameter System
Short-form URL parameters for efficient URLs:

**Core Parameters:**
- `m` - Manifest file path
- `type` - Content type (video, model, pdf, h5p, iframe)
- `src` - Content source URL
- `t` - Title
- `h` - Show header (boolean)
- `bg` - Background color

**Video Parameters:**
- `p` - Poster image
- `cs` - Caption source
- `cl` - Caption language
- `clb` - Caption label
- `cd` - Caption default

**Attribution Parameters:**
- `at/atu` - Title text/URL
- `aa/aau` - Author text/URL
- `al/alu` - License text/URL

### Security Features
- **Manifest Protection**: src and type cannot be overridden when using manifests
- **XSS Prevention**: HTML escaping for user content
- **CORS Handling**: Proper cross-origin content handling

### LMS Integration
- **Iframe Resizing**: PostMessage API for dynamic height adjustment
- **LTI Compatibility**: Standard LTI frameResize messages
- **H5P Support**: Specialized H5P resize handling
- **Dynamic Monitoring**: Continuous content size monitoring

---

## 🎯 Content Type Support

### Videos
- **HTML5**: MP4, WebM with full caption and poster support
- **YouTube**: Plyr-integrated player with responsive controls
- **Vimeo**: Complete functionality with player customization
- **Features**: Captions, transcripts, responsive controls, analytics

### 3D Models
- **Formats**: GLB, GLTF via Google's model-viewer
- **Interaction**: Camera controls, auto-rotation, zoom
- **AR**: Mobile AR support with device detection
- **Controls**: Reset view, toggle rotation, AR activation

### Documents
- **PDF**: Google Docs viewer integration
- **Features**: Full-screen viewing, responsive embedding

### Interactive Content
- **H5P**: Complete embed support with specialized resize handling
- **General Websites**: Iframe embedding with security headers

---

## 📱 Responsive Behavior

### Mobile Optimizations (≤480px)
- **Video**: Simplified Plyr controls (no volume slider)
- **Models**: Horizontal button layout with improved spacing
- **Transcripts**: Vertical stacking (≤450px)
- **Layout**: Single-column grid system

### Desktop Features (>480px)
- **Video**: Full Plyr control set with volume, settings, PiP
- **Transcripts**: Horizontal layout with visual reordering
- **Grid**: Multi-column responsive layouts

---

## 🔄 Development History & Changes

### Version 4 Major Changes
- **Framework Migration**: Lit web components → Vanilla JavaScript
- **Enhanced Video**: Added YouTube/Vimeo support with Plyr
- **Mobile Optimization**: Responsive controls and layouts
- **Improved Accessibility**: Better screen reader support, ARIA labels
- **Dynamic Controls**: Real-time adaptation to screen changes
- **Security Enhancement**: Manifest parameter protection
- **Attribution Redesign**: New flexible footer system
- **CSS Reorganization**: Better variable organization and theming

### Architecture Evolution
- **Plugin System**: Modular content type handlers
- **Parameter Shortening**: Efficient URL parameter system
- **Manifest Priority**: Security-focused configuration hierarchy
- **Responsive Design**: Mobile-first approach with breakpoints

---

## 🧪 Testing & Examples

### Test Suite (index.html)
- **Comprehensive Coverage**: All content types and configurations
- **Live Examples**: Working demonstrations of all features
- **Parameter Documentation**: Complete reference with examples
- **Responsive Testing**: Various screen size demonstrations

### Sample Content
- **Manifests**: Complete example configurations for each content type
- **Transcripts**: Multi-language sample files
- **Captions**: WebVTT format examples

---

## 🔧 Development Commands

```bash
# Start development server
npm start
# or
python3 -m http.server 8000

# Access test suite
http://localhost:8000

# Direct embed testing
http://localhost:8000/embed.html?type=video&src=...
```

---

## 📊 Analytics & Events

### Custom Events
- `wrapper:ready` - Initialization complete
- `theme:change` - Theme switching
- `video_play/pause/complete` - Video interactions
- `transcript_show/hide` - Transcript usage
- `model_loaded` - 3D model events
- `ar_activated` - AR mode engagement

### Tracking Integration
- Event bubbling for external analytics
- Detailed event data for user behavior analysis
- LMS integration compatibility

---

## 🎨 Styling System

### CSS Architecture
- **CSS Variables**: Theme-independent and theme-specific
- **BEM-like Naming**: `.lo-*` prefix for all classes
- **Responsive Design**: Mobile-first media queries
- **Component Isolation**: Scoped styling for each component

### Theme Variables
```css
/* Theme-independent */
--lo-spacing-xs: 0.25rem
--lo-spacing-sm: 0.5rem
--lo-spacing-lg: 1.5rem
--lo-spacing-xl: 2rem
--lo-border-radius: 8px

/* Theme-specific */
--lo-color-background
--lo-color-surface
--lo-color-border
--lo-color-text
```

---

## 🚀 Deployment & Integration

### Requirements
- **HTTP Server**: Required for ES modules
- **Modern Browser**: ES6+ support
- **No Build Process**: Direct deployment ready

### Integration Examples
```html
<!-- LMS Embed -->
<iframe src="embed.html?m=lesson1.json&h=true" 
        width="100%" height="600"></iframe>

<!-- Direct Video -->
<iframe src="embed.html?type=video&src=video.mp4&t=Lesson" 
        width="100%" height="400"></iframe>
```

---

## 📈 Performance Characteristics

- **Lazy Loading**: External libraries loaded on demand
- **Minimal Dependencies**: Plyr and model-viewer only when needed
- **Efficient Resizing**: Debounced resize handling
- **Memory Management**: Proper cleanup on destroy
- **CDN Integration**: External resources via CDN

---

## 🔒 Security Considerations

- **Parameter Validation**: Input sanitization and validation
- **XSS Prevention**: HTML escaping for user content
- **Manifest Integrity**: Protected src/type parameters
- **CORS Compliance**: Proper cross-origin handling
- **Iframe Security**: Appropriate sandbox attributes

---

This project represents a mature, production-ready solution for learning object embedding with comprehensive feature support, security considerations, and accessibility compliance.

---

## 🔮 Future Enhancement Roadmap

### 3D Model Hotspots
**Priority:** Medium  
**Description:** Interactive hotspots for 3D models with manifest support

**Proposed Implementation:**
- **Manifest Schema:** Add `hotspots` array with position, normal, label, and annotation data
- **URL Parameters:** Short form hotspot support (`hs1=eye|0.64,1.36,0.15|0.56,0.19,0.80`)
- **Model Plugin Enhancement:** Dynamic hotspot generation from manifest/URL parameters
- **Styling System:** Default hotspot CSS with customization via CSS variables
- **Accessibility:** ARIA labels and keyboard navigation for hotspots
- **Analytics:** Hotspot interaction tracking and event dispatching

**Manifest Example:**
```json
{
  "type": "model",
  "resources": {
    "model": "Duck.glb",
    "iosSrc": "Duck.usdz"
  },
  "hotspots": [
    {
      "id": "hotspot-1",
      "label": "eye",
      "position": "0.64m 1.36m 0.15m",
      "normal": "0.56m 0.19m 0.80m",
      "visible": true,
      "annotation": {
        "text": "Eye details",
        "html": "<div class='custom-hotspot'>Custom content</div>"
      }
    }
  ]
}
```

**Technical Benefits:**
- Declarative hotspot definition consistent with existing manifest pattern
- Works across all AR modes (WebXR, Scene Viewer, Quick Look)
- Progressive enhancement (model works without hotspots)
- Leverages model-viewer's native slot system for dynamic injection