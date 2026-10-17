# AccessVision – Implementation Guide & Code Documentation

This document serves as the comprehensive technical implementation reference for the **AccessVision** platform. It details codebase organization, architecture walkthroughs, dependency setup, and production deployment workflows.

---

## 1. Development Environment Prerequisites

Ensure the following tools are installed on the development host:
- **Node.js**: Version 18.17.0, 20.x, or 22.x LTS
- **npm**: Version 9.x or higher
- **Web Browser**: Google Chrome (version 120+) or Microsoft Edge (version 120+) with Developer Mode enabled.
- **Screen Reader (for manual testing)**:
  - Windows: NVDA 2024.1+ (free & open source) or JAWS.
  - macOS: Apple VoiceOver (built into macOS).

---

## 2. Directory Structure & Workspace Setup

```text
AccessVision/
├── website/                 # React 18 + Vite accessible demo site
│   ├── src/
│   │   ├── components/      # Accessible components (Header, Footer, Toolbar, SkipLink)
│   │   ├── contexts/        # AccessibilityContext & state provider
│   │   ├── hooks/           # useFocusManagement, useAnnounce
│   │   ├── pages/           # HomePage, ArticlesPage, ContactPage, AboutPage
│   │   ├── App.tsx          # Router and global landmark container
│   │   └── main.tsx         # Application entry
│   ├── package.json
│   ├── tailwind.config.js   # Tailored accessible color palette
│   └── vite.config.ts
├── extension/               # Manifest V3 browser extension
│   ├── background/          # service-worker.js (command & message routing)
│   ├── content/             # content-script.js & content-styles.css
│   ├── offscreen/           # offscreen.html & offscreen.js (audio playback subsystem)
│   ├── popup/               # popup.html, popup.css, popup.js
│   ├── options/             # options.html, options.css, options.js
│   ├── icons/               # 16, 32, 48, 128px PNG icons
│   └── manifest.json        # Manifest V3 configuration
├── backend/                 # AI & Assistive Services (Dual Stack)
│   ├── server.py            # Standalone zero-dependency Python 3.8+ server
│   ├── src/                 # Node.js + Express alternative implementation
│   │   ├── routes/          # summarize.js, altText.js, audit.js, feedback.js
│   │   ├── services/        # summarizer.js, imageDescriber.js, aiProvider.js
│   │   └── server.js        # Express application entry
│   └── package.json
├── tests/                   # Automated accessibility & functional tests
│   ├── accessibility.spec.ts
│   ├── extension.spec.ts
│   ├── scripts/
│   │   └── run-audit.js     # Standalone WCAG 2.2 AA audit verification
│   └── playwright.config.ts
├── docs/                    # Complete academic documentation
├── README.md
└── LICENSE
```

---

## 3. Step-by-Step Build & Run Instructions

### 3.1 Running the Demo Website Locally
```bash
# Navigate to website directory
cd AccessVision/website

# Install npm dependencies
npm install

# Launch Vite local development server
npm run dev
```
The website will boot at `http://localhost:5173`.

### 3.2 Running the Backend Microservice (Dual Stack Options)

**Option A — Python (Zero external dependencies, standard library):**
```bash
cd AccessVision/backend
python server.py
```

**Option B — Node.js & Express:**
```bash
cd AccessVision/backend
npm install
npm start
```
Both options start on port `3001`. Verify service health via:
```bash
curl http://localhost:3001/api/health
```

### 3.3 Loading the AccessVision Assistant Extension in Chrome/Edge
1. Open Google Chrome or Microsoft Edge.
2. Navigate to `chrome://extensions` or `edge://extensions`.
3. In the upper-right corner, toggle **Developer mode** to **ON**.
4. Click **Load unpacked** (or "Load unpacked extension").
5. Select the `AccessVision/extension` directory.
6. The AccessVision Assistant icon will appear in the browser toolbar. Pin the extension for quick access.

### 3.4 Executing Automated Accessibility & E2E Tests
```bash
cd AccessVision/tests
npm install

# Run standalone WCAG 2.2 AA audit check
npm run audit

# Run full cross-browser Playwright test suite
npx playwright install
npm test
```

---

## 4. Key Code Implementations & Architectural Highlights

### 4.1 Accessible Live Region Management (`AccessibilityContext.tsx`)
Screen readers must be notified of asynchronous state transitions (e.g., contrast toggle, form errors, filter changes) without stealing keyboard focus:

```tsx
// Inside AccessibilityContext.tsx:
<div 
  id="av-live-polite" 
  role="status" 
  aria-live="polite" 
  aria-atomic="true" 
  className="sr-only"
>
  {announcements.polite}
</div>

<div 
  id="av-live-assertive" 
  role="alert" 
  aria-live="assertive" 
  aria-atomic="true" 
  className="sr-only"
>
  {announcements.assertive}
</div>
```

### 4.2 Focus Restoration on Route Changes (`useFocusManagement.ts`)
In standard client-side SPAs, navigating to a new route causes screen readers to lose focus, remaining silent on the old page coordinates. AccessVision implements a route-change focus manager that locates the new page's primary `<h1>` element, applies `tabIndex={-1}`, and directs programmatic focus there:

```typescript
export function usePageFocus(locationKey: string) {
  useEffect(() => {
    const heading = document.querySelector<HTMLHeadingElement>('main h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }, [locationKey]);
}
```

### 4.3 Voice Command Dispatcher in Extension (`content-script.js`)
Uses the `webkitSpeechRecognition` API with real-time intent classification:

```javascript
recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
  
  if (transcript.includes('read page') || transcript.includes('read article')) {
    readPageContent();
  } else if (transcript.includes('urdu') || transcript.includes('اردو')) {
    readPageInLanguage('ur');
  } else if (transcript.includes('english')) {
    readPageInLanguage('en');
  } else if (transcript.includes('summarize')) {
    summarizePage();
  } else if (transcript.includes('next heading')) {
    navigateHeading('next');
  } else if (transcript.includes('previous heading')) {
    navigateHeading('prev');
  } else if (transcript.includes('contrast')) {
    toggleHighContrast();
  } else if (transcript.includes('stop')) {
    stopReading();
  }
};
```

### 4.4 Audio Offscreen Document Subsystem (`offscreen.js` & `service-worker.js`)
To circumvent Chrome Manifest V3 service-worker limitations (inability to create DOM `Audio` objects) and host-page CSP audio blocking, audio is streamed through a dedicated offscreen document:

```javascript
// In service-worker.js:
async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen/offscreen.html',
    reasons: ['AUDIO_PLAYBACK'],
    justification: 'Play speech synthesis audio for accessibility without CSP or autoplay restrictions',
  });
}

// In offscreen.js:
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') return;
  if (message.action === 'play') {
    const audio = new Audio(message.audioData);
    audio.playbackRate = parseFloat(message.rate) || 1.0;
    audio.volume = parseFloat(message.volume) || 1.0;
    audio.play().then(() => sendResponse({ success: true }));
    audio.onended = () => chrome.runtime.sendMessage({ action: 'audioPlaybackEnded', id: message.id });
    return true;
  }
});
```

---

## 5. Production Packaging & Deployment Workflows

### 5.1 Deploying the Website to Vercel or Netlify
The website is ready for zero-configuration static site deployment:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x or 20.x

For Netlify, ensure `website/public/_redirects` contains:
```text
/*    /index.html   200
```
This guarantees that direct navigations to `/articles`, `/contact`, and `/about` route properly to the React SPA.

### 5.2 Packaging the Extension for the Chrome Web Store
To prepare the extension for distribution:
1. Open terminal in `AccessVision/extension`.
2. Ensure manifest version and metadata are updated.
3. Compress extension files into a zip archive:
```bash
# In PowerShell:
Compress-Archive -Path * -DestinationPath ../AccessVision-Assistant-v1.0.0.zip -Force
```
4. Upload `AccessVision-Assistant-v1.0.0.zip` to the **Chrome Developer Dashboard**.
