# Learning Object Wrapper v4

A universal wrapper for embedding different types of learning content with support for videos (YouTube, Vimeo, HTML5), 3D models, PDFs, H5P, and websites. Features automatic theming, iframe resize handling, transcript support, and analytics tracking.

---

## ✅ Features

- **Multiple Content Types**: Video (HTML5, YouTube, Vimeo), 3D Models, PDFs, H5P, Websites
- **Gaussian Splat Viewer**: PlayCanvas SuperSplat integration for .ply point clouds
- **Video Player**: Plyr integration with responsive controls and caption support
- **3D Models**: Model-viewer with AR support and interactive controls
- **Responsive Design**: Mobile-optimized controls and layouts
- **Accessibility**: Screen reader support, proper ARIA labels, keyboard navigation
- **Theming**: Automatic dark/light theme detection with manual override
- **Transcripts**: Multi-language transcript support with toggle controls
- **Attribution**: Flexible attribution footer system
- **Analytics**: Built-in event tracking for user interactions
- **LMS Integration**: Automatic iframe resizing for seamless LMS embedding

---

## 📁 Files

- `embed.html` — Universal wrapper endpoint
- `wrapper.js` — Core wrapper class (vanilla JavaScript)
- `wrapper.css` — Complete styling system
- `plugins/` — Content type plugins (video, model, Gaussian splat, PDF, etc.)
- `assets/manifests/` — Manifest examples
- `assets/transcripts/` — Sample transcript files
- `assets/captions/` — Sample caption files (WebVTT)
- `index.html` — Complete test suite and documentation
- `supersplat-viewer/` — Local copy of PlayCanvas SuperSplat viewer (MIT)

---

## 🚀 Quick Start

### Option 1: Direct URL Parameters

Load content directly with URL parameters:

```
embed.html?type=video&src=https://youtube.com/watch?v=123&t=My+Video&h=true
```

### Option 2: Manifest-based (Recommended)

Use a manifest file for complete configuration:

```
embed.html?m=assets/manifests/sample-video.json
```

---

## 📋 URL Parameters

### Core Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `m` | string | Path to manifest file | `assets/manifests/sample-video.json` |
| `type` | string | Content type (video, model, pdf, h5p, iframe) | `video` |
| `src` | string | Content source URL | `https://youtube.com/watch?v=123` |
| `t` | string | Learning object title | `My+Learning+Video` |
| `h` | boolean | Show/hide header | `true` or `false` |
| `bg` | string | Custom background color | `%23e3f2fd` (use %23 for #) |

### Video Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `p` | string | Poster image URL for HTML5 videos | `assets/images/poster.jpg` |
| `cs` | string | Caption file URL (WebVTT format) | `assets/captions/en.vtt` |
| `cl` | string | Caption language code | `en` |
| `clb` | string | Caption language label | `English` |
| `cd` | boolean | Set as default caption track | `true` |

### Attribution Parameters
Generate attribution footers in format: *"Title" by Author is licensed under License*

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `at` | string | Attribution title text | `My+Video` |
| `atu` | string | Attribution title URL | `https://example.com` |
| `aa` | string | Attribution author text | `John+Doe` |
| `aau` | string | Attribution author URL | `https://johndoe.com` |
| `al` | string | Attribution license text | `CC+BY-ND+4.0` |
| `alu` | string | Attribution license URL | `https://creativecommons.org/licenses/by-nd/4.0` |

---

## 📄 Manifest Format

Manifest files provide complete configuration in JSON format:

```json
{
  "id": "sample-video",
  "type": "video",
  "title": "Learning Video Demo",
  "src": "https://youtube.com/watch?v=123",
  "poster": "assets/images/poster.jpg",
  "showHeader": true,
  "captions": [
    {
      "src": "assets/captions/en.vtt",
      "language": "en",
      "label": "English",
      "default": true
    }
  ],
  "transcripts": [
    {
      "language": "en",
      "url": "assets/transcripts/sample-en.txt",
      "default": true
    }
  ],
  "attribution": {
    "title": {
      "text": "Video Title",
      "url": "https://example.com"
    },
    "author": {
      "text": "Creator Name",
      "url": "https://creator.com"
    },
    "license": {
      "text": "CC BY 4.0",
      "url": "https://creativecommons.org/licenses/by/4.0/"
    }
  }
}
```

---

## 🎯 Supported Content Types

### Videos
- **HTML5 Video**: MP4, WebM with captions and poster support
- **YouTube**: Full Plyr integration with responsive controls
- **Vimeo**: Complete player functionality
- **Features**: Mobile-optimized controls, captions, transcripts

### 3D Models
- **Format**: GLB/GLTF models via model-viewer
- **Features**: Camera controls, auto-rotation, AR support (mobile)
- **Controls**: Reset view, toggle rotation, AR mode

### PDFs
- **Viewer**: Google Docs viewer integration
- **Features**: Full-screen viewing, responsive layout

### Interactive Content
- **H5P**: Complete H5P embed support with resize handling
- **Websites**: General iframe embedding with security headers

---

## 📱 Responsive Features

### Mobile Optimizations (≤480px)
- **Video Controls**: Simplified Plyr controls (no volume slider)
- **Model Controls**: Horizontal button layout
- **Transcript Controls**: Vertical stacking
- **Layout**: Single-column responsive grid

### Desktop Features (>480px)
- **Video Controls**: Full Plyr control set
- **Transcript Layout**: Horizontal with visual reordering
- **Multi-column**: Responsive grid layouts

---

## 🎨 Theming

### Automatic Theme Detection
- Respects user's system preference (`prefers-color-scheme`)
- Supports manual override via configuration
- Smooth transitions between themes

### Theme Options
- **Light Theme**: Clean, bright interface
- **Dark Theme**: Reduced eye strain for low-light environments
- **Auto**: Follows system preference

---

## 🔧 Parameter Priority Order

1. **Manifest File (src & type)** - Cannot be overridden for security
2. **URL Parameters** - Override other manifest values
3. **Manifest File (other values)** - Base configuration
4. **Default Values** - Lowest priority

**Note**: When using a manifest file, the `src` and `type` parameters cannot be overridden by URL parameters for security and consistency.

---

## 📊 Analytics & Events

The wrapper dispatches custom events for analytics tracking:

- `wrapper:ready` - Wrapper initialization complete
- `video_play`, `video_pause`, `video_complete` - Video interactions
- `transcript_show`, `transcript_hide` - Transcript usage
- `model_loaded`, `camera_reset`, `ar_activated` - 3D model interactions

---

## 🌐 LMS Integration

### Iframe Resizing
Automatic height adjustment using `postMessage` API:
- LTI-compatible resize messages
- H5P resize support
- Dynamic content monitoring

### Security
- Proper iframe sandbox attributes
- CORS headers for cross-origin content
- XSS protection for user-provided content

---

## 🧪 Examples

The `index.html` file contains a complete test suite with examples of:
- Video content with captions and transcripts
- 3D models with interactive controls
- PDF viewers with headers
- H5P interactive content
- Various configuration combinations

---

## 📦 Installation

1. Clone or download the repository
2. Serve files via HTTP server (required for ES modules)
3. Access `index.html` for examples or `embed.html` for direct embedding

```bash
# Simple Python server
python3 -m http.server 8000

# Then visit http://localhost:8000
```

---

## 🔗 Integration Examples

### LMS Embed
```html
<iframe src="https://yoursite.com/embed.html?m=manifests/lesson1.json&h=true" 
        width="100%" height="600" frameborder="0"></iframe>
```

### Direct Video
```html
<iframe src="https://yoursite.com/embed.html?type=video&src=https://youtube.com/watch?v=123&t=My+Lesson" 
        width="100%" height="400" frameborder="0"></iframe>
```

### 3D Model
```html
<iframe src="https://yoursite.com/embed.html?type=model&src=model.glb&t=3D+Demo" 
        width="100%" height="500" frameborder="0"></iframe>
```

---

## 🆕 Version 4 Changes

- **Vanilla JavaScript**: Removed Lit dependency for better compatibility
- **Enhanced Video Support**: YouTube/Vimeo integration with Plyr
- **Mobile Optimization**: Responsive controls and layouts
- **Improved Accessibility**: Better screen reader support
- **Dynamic Controls**: Plyr controls adapt to screen size
- **Flexible Attribution**: New attribution system with underlined links
- **Enhanced Theming**: Better CSS variable organization
- **Security**: Manifest src/type protection from URL override