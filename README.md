# AccessVision – Web Accessibility for Visually Impaired People

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG-2.2%20AA-green.svg)](#accessibility-compliance)
[![Lighthouse Score](https://img.shields.io/badge/Lighthouse%20Accessibility-95%2B-brightgreen.svg)](#testing)

> A comprehensive web accessibility system comprising an accessible demonstration website and a browser extension that enhances any webpage for visually impaired users.

## 🎯 Project Overview

**AccessVision** is a final-year university project that addresses the digital accessibility gap for blind and low-vision web users. The system consists of two integrated components:

1. **AccessVision Hub** – A fully WCAG 2.2 AA compliant demonstration website built with React, TypeScript, and Tailwind CSS.
2. **AccessVision Assistant** – A Manifest V3 browser extension providing voice control, high-contrast modes, page summarization, landmark navigation, and AI-assisted alt-text generation for any website.

## 📁 Project Structure

```
AccessVision/
├── website/                 # React 18 + Vite accessible demo site
│   ├── src/
│   │   ├── components/      # Reusable accessible UI components
│   │   ├── pages/           # Page components (Home, Articles, Contact, About)
│   │   ├── contexts/        # React contexts (Accessibility settings)
│   │   ├── hooks/           # Custom React hooks (focus, announce)
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
├── extension/               # Manifest V3 browser extension
│   ├── popup/               # Extension popup UI & voice controls
│   ├── options/             # Extension options & voice preferences
│   ├── content/             # Content scripts injected into web pages
│   ├── background/          # Service worker (background message routing)
│   ├── offscreen/           # Offscreen audio player (Manifest V3 CSP bypass)
│   └── manifest.json
├── backend/                 # AI & Accessibility Assistance Backend (Dual Stack)
│   ├── server.py            # Standalone zero-dependency Python 3.8+ server
│   ├── src/                 # Node.js + Express alternative implementation
│   │   ├── server.js
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── docs/                    # Complete academic documentation
│   ├── Project-Proposal.md
│   ├── SRS.md
│   ├── Design.md
│   ├── Testing-Report.md
│   ├── User-Manual.md
│   ├── Final-Report.md
│   └── Presentation-Outline.md
├── tests/                   # Automated accessibility & functional tests
│   ├── accessibility.spec.ts
│   ├── extension.spec.ts
│   ├── scripts/run-audit.js # Automated WCAG 2.2 AA audit verification
│   └── playwright.config.ts
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

### 2. Run the Demo Website

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Load the Browser Extension

1. Open Chrome/Edge and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` directory
5. The AccessVision icon appears in the toolbar. Pin it for quick access.

### 4. Run the Backend Microservice (Dual Stack: Python or Node.js)

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

### 5. Run Accessibility & Audit Tests

```bash
cd tests
npm install
# Run automated standalone WCAG 2.2 AA audit
npm run audit

# Run full end-to-end browser test suite with Playwright
npx playwright install
npm test
```

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
