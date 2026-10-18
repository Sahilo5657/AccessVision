# AccessVision – Web Accessibility for Visually Impaired People

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-green.svg)](#accessibility-compliance)
[![Lighthouse Score](https://img.shields.io/badge/Lighthouse%20Accessibility-95%2B-brightgreen.svg)](#testing)

> A comprehensive web accessibility system comprising an accessible demonstration website and a browser extension that enhances any webpage for visually impaired users.

## 🎯 Project Overview

**AccessVision** is a comprehensive accessibility system that addresses the digital accessibility gap for blind and low-vision web users. The system consists of three complementary components:

1. **AccessVision PWA** – A standalone Progressive Web App installable on Mobile (iOS & Android) and Desktop with full-page reading, natural English and Urdu speech synthesis, high contrast modes, and voice commands.
2. **AccessVision Assistant** – A Manifest V3 browser extension providing voice control, high-contrast modes, page summarization, landmark navigation, and AI-assisted alt-text generation for any website.
3. **AccessVision Hub** – A fully WCAG 2.2 AA compliant demonstration website built with React, TypeScript, and Tailwind CSS.

## 📁 Project Structure

```
AccessVision/
├── pwa/                     # Progressive Web App (React 18 + Vite + PWA Service Worker)
│   ├── public/
│   │   ├── icons/           # High-resolution PWA icons (192x192, 512x512, maskable, SVG)
│   │   ├── manifest.json    # Web App Manifest for mobile and desktop installability
│   │   ├── manifest.webmanifest
│   │   └── sw.js            # Offline service worker caching app shell and articles
│   ├── src/
│   │   ├── components/      # Accessible UI components (ReaderView, PlaybackDock, Toolbar)
│   │   ├── contexts/        # React contexts (AccessibilityContext, PlaybackContext)
│   │   ├── services/        # Audio engine, Urdu detector, voice command recognition
│   │   ├── App.jsx
│   │   ├── index.css        # Accessible Vanilla CSS design system (WCAG AAA contrast themes)
│   │   └── main.jsx
│   ├── vite.config.js       # Vite configuration with PWA support
│   └── package.json
├── extension/               # Manifest V3 browser extension (Unmodified & fully working)
│   ├── popup/               # Extension popup UI & voice controls
│   ├── options/             # Extension options & voice preferences
│   ├── content/             # Content scripts injected into web pages
│   ├── background/          # Service worker (background message routing)
│   ├── offscreen/           # Offscreen audio player (Manifest V3 CSP bypass)
│   └── manifest.json
├── website/                 # React 18 + Vite accessible demo site
│   ├── src/
│   │   ├── components/      # Reusable accessible UI components
│   │   ├── pages/           # Page components (Home, Articles, Contact, About)
│   │   ├── contexts/        # React contexts (Accessibility settings)
│   │   ├── hooks/           # Custom React hooks (focus, announce)
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # AI & Accessibility Assistance Backend (Dual Stack)
│   ├── server.py            # Standalone zero-dependency Python 3.8+ server
│   ├── src/                 # Node.js + Express alternative implementation
│   │   ├── server.js
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── docs/                    # Complete academic documentation
├── tests/                   # Automated accessibility & functional tests
├── README.md
└── LICENSE
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.x and **npm** ≥ 9.x
- **Python** ≥ 3.8 (Optional, for zero-dependency Python backend)
- **Google Chrome** or **Microsoft Edge** (for the extension)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/AccessVision.git
cd AccessVision
```

### 2. Run the Progressive Web App (PWA)

```bash
cd pwa
npm install
npm run dev
```

Open [http://localhost:5174](http://localhost:5174) in your desktop browser or mobile phone browser.

### 3. Run the Demo Website

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Load the Browser Extension

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` directory
5. The AccessVision icon appears in the toolbar. Pin it for quick access.

### 5. Run the Backend Microservice (Dual Stack: Python or Node.js)

**Option A — Python (Zero external dependencies):**
```bash
cd backend
python server.py
```

**Option B — Node.js & Express:**
```bash
cd backend
npm install
npm start
```

The API server starts at [http://localhost:3001](http://localhost:3001). Health check: `http://localhost:3001/api/health`.

### 6. Run Accessibility & Audit Tests

```bash
cd tests
npm install
# Run automated standalone WCAG 2.2 AA audit
npm run audit

# Run full end-to-end browser test suite with Playwright
npx playwright install
npm test
```

## 📱 Progressive Web App (PWA) – AccessVision

The **AccessVision PWA** is an accessible, cross-platform reader and voice assistant built with React 18, Vite, and custom accessible CSS. It functions as a standalone application on mobile phones and desktop computers without requiring browser extensions or app store downloads.

### PWA Key Features

- **Full Page Content Reading**: Reads articles, documents, and user-pasted text paragraph by paragraph and sentence by sentence with live visual sentence highlighting (`av-active-sentence`).
- **Natural Urdu Language Support**:
  - Automatically identifies Urdu text using Unicode character analysis.
  - Streams high-quality, warm, and natural Urdu synthetic speech via the AccessVision Natural Urdu Cloud engine (`online-natural-urdu`) or system-installed Urdu voices (`ur-PK`).
  - Native RTL layout and Noto Nastaliq Urdu typography.
- **Warm & Cozy Voices**: Prioritizes natural and neural speech synthesizers (Google Natural, Samantha, Jenny, Aria) over harsh, robotic legacy voices to reduce cognitive fatigue.
- **Voice Control & Hands-Free Navigation**: Hands-free voice recognition recognizing commands like *"Read"*, *"Pause"*, *"Resume"*, *"Stop"*, *"Urdu"*, *"English"*, *"Contrast"*, and *"Reading Mode"*.
- **WCAG 2.2 AAA High Contrast Themes**:
  1. **Obsidian Slate** (Default modern dark theme)
  2. **Yellow on Black** (Max legibility for low-vision users)
  3. **Cyan on Black** (High-contrast cool palette)
  4. **Monochrome White on Black** (Pure black & white)
  5. **Soft Sepia Cream** (Gentle eye comfort)
- **Distraction-Free Reading Mode**: Hides extraneous headers, toolbars, and controls to provide a clean reading sanctuary.
- **Dyslexia-Friendly Font**: One-click toggle switching typography to Atkinson Hyperlegible.
- **Font Scaling**: 5 accessible scaling presets from 85% up to 180%.
- **Tactile Playback Dock**: Large 48px–56px touch targets for mobile accessibility.
- **TalkBack & VoiceOver Compatibility**: Built with semantic HTML5 landmarks, ARIA live region announcer (`#av-live-announcer`), and haptic vibration feedback.
- **Offline First**: Service worker caching app shell and static resources, enabling offline reading anywhere.

### How to Install the PWA

#### Desktop (Chrome, Edge, Brave, Safari)
1. Open [http://localhost:5174](http://localhost:5174) in Google Chrome or Microsoft Edge.
2. Click the **Install** button in the header toolbar, or click the **Install icon (🖥️)** in your browser address bar.
3. Click **Install** in the confirmation prompt.
4. AccessVision opens in its own standalone app window and appears in your Start Menu or Applications folder.

#### Mobile – Android (Chrome)
1. Navigate to the app URL on Chrome for Android.
2. Tap the **Install** button in the top banner, or tap the three dots menu (⋮) -> **Install app** / **Add to Home screen**.
3. The AccessVision icon is placed on your home screen and drawer, opening in full-screen standalone mode with native system gestures.

#### Mobile – iPhone & iPad (Safari)
1. Navigate to the app URL in Safari on iOS.
2. Tap the **Share** button (📤 square with arrow up) at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen** (➕).
4. Tap **Add** in the top-right corner. AccessVision will launch as a full-screen, standalone app with no browser URL bar.

## ♿ Accessibility Compliance

This project targets **WCAG 2.2 Level AA** compliance:

| Principle | Implementation |
|-----------|---------------|
| **Perceivable** | Alt text, captions, high-contrast modes, resizable text, semantic HTML |
| **Operable** | Full keyboard navigation, skip links, no time limits, focus management |
| **Understandable** | Clear language, consistent navigation, error identification, input assistance |
| **Robust** | Valid HTML, ARIA landmarks, screen-reader tested (NVDA, VoiceOver) |

## 🧪 Testing

### Automated Testing
- **axe-core** integration for WCAG violation detection
- **Playwright** end-to-end tests with accessibility assertions
- **Lighthouse CI** for performance and accessibility scoring

### Screen Reader Testing
Manually tested with:
- **NVDA** 2024.x on Windows
- **VoiceOver** on macOS Sonoma
- **TalkBack** on Android (mobile Chrome)
- **JAWS** 2024 on Windows

See [Testing Report](docs/Testing-Report.md) for detailed results.

## 🎙️ Voice Commands & Speech Synthesis (Extension)

The AccessVision Assistant features advanced speech synthesis supporting **English and Urdu**, complete with auto-detection of Urdu text, synchronized sentence-level visual highlighting, speech sliders (rate, pitch, volume), and audio playback via a Manifest V3 offscreen player:

| Voice Command | Action |
|---------------|--------|
| "Read page" / "Read article" | Reads the full page content aloud with sentence highlighting |
| "Read in Urdu" / "اردو میں پڑھیں" | Reads the page content using high-quality Natural Urdu speech |
| "Read in English" | Reads the page content using optimized English natural voice |
| "Pause" | Pauses active speech synthesis / audio playback |
| "Resume" | Resumes playback from paused location |
| "Stop reading" / "Stop" | Immediately halts audio and clears visual highlights |
| "Summarize" | Extracts and speaks an AI/NLP 3-bullet page summary |
| "Next heading" | Moves focus and scrolls to the next heading element |
| "Previous heading" | Moves focus to the previous heading element |
| "Go to navigation" | Jumps focus to the navigation landmark |
| "Go to main" | Jumps focus directly to the main content area |
| "Increase contrast" / "Contrast" | Toggles WCAG 2.2 compliant high-contrast mode (≥ 7:1) |
| "Reading mode" | Activates distraction-free, single-column reading view |
| "List headings" | Announces the complete heading outline structure |
| "List landmarks" | Announces all ARIA landmarks on the active page |

## ⌨️ Keyboard Shortcuts (Extension)

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Alt+Shift+V` | Open AccessVision panel | Launches extension popup interface |
| `Alt+Shift+R` | Toggle reading mode | Strips clutter into clean reading column |
| `Alt+Shift+C` | Toggle high contrast | Toggles obsidian/amber high-contrast palette |
| `Alt+Shift+S` | Summarize page | Generates and speaks 3-bullet page summary |
| `Alt+Shift+H` | List headings | Cycles or lists headings outline |
| `Alt+Shift+L` | List landmarks | Outlines ARIA landmark distribution |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Project Proposal](docs/Project-Proposal.md) | Abstract, objectives, and scope |
| [SRS](docs/SRS.md) | Software Requirements Specification |
| [System Design](docs/Design.md) | Architecture, components, data flow |
| [Testing Report](docs/Testing-Report.md) | Test results and accessibility audits |
| [User Manual](docs/User-Manual.md) | Installation and usage guide |
| [Final Report](docs/Final-Report.md) | Complete academic thesis document |
| [Presentation Outline](docs/Presentation-Outline.md) | Defense presentation slides |

## 🏗️ Deployment

### Website Deployment (Vercel)

```bash
cd website
npm run build
# Deploy the dist/ folder to Vercel or Netlify
npx vercel --prod
```

### Extension Packaging (Chrome Web Store)

1. Run production build if using bundler, otherwise the extension is ready as-is
2. Zip the `extension/` folder
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure all contributions maintain WCAG 2.2 AA compliance.

## 🙏 Acknowledgments

- [W3C Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core](https://github.com/dequelabs/axe-core) by Deque Systems
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Playwright](https://playwright.dev/)
- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ♿ accessibility at the core** | Final Year Project 2026
