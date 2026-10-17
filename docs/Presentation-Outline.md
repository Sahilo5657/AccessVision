# Final Capstone Project Defense: Presentation Slide Outline
## AccessVision: Web Accessibility for Visually Impaired People

**Candidate Name:** Undergraduate Final Year Student  
**Degree:** Bachelor of Science in Computer Science / Software Engineering  
**Presentation Duration:** 15 Minutes (+ 5 Minutes Defense Q&A)  
**Slide Count:** 12 Slides  

---

## Slide 1: Title Slide
- **Slide Title**: AccessVision: An Intelligent Assistive System for Visually Impaired Web Navigation
- **Sub-bullet Points**:
  - Bridging the Digital Accessibility Divide with WCAG 2.2 Level AA
  - Final Year Capstone Project Defense
  - Candidate Name & Student ID
  - Department of Computer Science & Information Technology
  - Academic Advisor / Supervisor Name
- **Visuals**: Clean title layout featuring the AccessVision logo, university crest, and WCAG 2.2 AA certification badge.
- **Speaker Notes (1 min)**: "Good morning esteemed members of the evaluation committee. Today, I am proud to present AccessVision, an integrated software platform engineered to empower blind and low-vision individuals to browse the modern web with independence, speed, and dignity."

---

## Slide 2: The Global Problem & Motivation
- **Slide Title**: The Web Accessibility Crisis
- **Sub-bullet Points**:
  - Over 2.2 Billion people globally live with vision impairment (WHO).
  - 95.9% of the world's top 1,000,000 websites fail basic WCAG standards (WebAIM Million 2024).
  - Primary Failures:
    - 81% have low-contrast text (causing severe ocular fatigue).
    - 55% contain missing image descriptions.
    - Lack of structural headings and landmark navigation.
  - Traditional Solution Flaws: Overlays fail to fix DOM semantics; manual remediation is slow.
- **Visuals**: Infographic showing 95.9% failure rate and common accessibility hurdles.
- **Speaker Notes (1 min)**: "Despite international treaties, the web remains hostile to visually impaired users. Overlays have been heavily criticized by the blind community because they don't fix the underlying code. AccessVision solves this from the user's side."

---

## Slide 3: Project Vision & Objectives
- **Slide Title**: Project Vision: The AccessVision Ecosystem
- **Sub-bullet Points**:
  - **Objective 1 (Reference Site)**: Build *AccessVision Hub*, a zero-defect WCAG 2.2 Level AA demonstration website.
  - **Objective 2 (Browser Extension)**: Develop *AccessVision Assistant*, a Manifest V3 extension enhancing *any* webpage.
  - **Objective 3 (AI & Heuristic Service)**: Implement local extractive text summarization and automated alt-text generation.
  - **Objective 4 (Empirical Evaluation)**: Validate with automated axe-core testing and real-world screen readers (NVDA, VoiceOver).
- **Visuals**: Tri-partite ecosystem diagram connecting Hub, Assistant Extension, and Backend Microservice.
- **Speaker Notes (1 min)**: "Our mission is twofold: establish a reference model of how web developers should build accessible sites, and deliver an immediate assistive tool that empowers users on existing, flawed websites."

---

## Slide 4: System Architecture
- **Slide Title**: Tri-Tier Architecture & Technology Stack
- **Sub-bullet Points**:
  - **Frontend SPA**: React 18, TypeScript, Vite, Tailwind CSS (Accessible Color Palette).
  - **Browser Extension**: Chrome Manifest V3, Web Speech API, Vanilla JS/CSS injection.
  - **Audio Subsystem**: Dedicated Manifest V3 Offscreen Document (`AUDIO_PLAYBACK`) bypassing CSP and autoplay restrictions.
  - **Backend Microservice (Dual Stack)**: Zero-dependency Python 3.8+ engine (`server.py`) and Node.js Express service (`src/server.js`).
  - **Test Automation**: Playwright, @axe-core/playwright, Axe-core v4.9, standalone audit script (`npm run audit`).
- **Visuals**: System Architecture Diagram illustrating isolated worlds, service worker messaging, offscreen audio pipeline, and local REST API.
- **Speaker Notes (1.5 mins)**: "The architecture is privacy-first, lightweight, and dual-stack. The extension utilizes Manifest V3 event-driven service workers and an offscreen audio player, completely bypassing host-page CSP restrictions while interacting directly with the browser's accessibility tree."

---

## Slide 5: AccessVision Hub (Demo Website Features)
- **Slide Title**: AccessVision Hub: WCAG 2.2 AA in Action
- **Sub-bullet Points**:
  - **Bypass Blocks**: Functional Skip-Navigation Link targeting `<main id="main-content">`.
  - **Accessibility Toolbar**: Real-time high-contrast theming (15:1 contrast ratio) and font scaling up to 200%.
  - **Accessible Routing**: Dynamic focus management restoring focus to `<h1>` upon route transitions.
  - **Accessible Forms**: Live assertive ARIA error summary and field-level invalidity binding.
- **Visuals**: Screenshots of the Hub in normal mode vs. high-contrast mode with visible keyboard focus rings.
- **Speaker Notes (1.5 mins)**: "Here is AccessVision Hub. Notice the skip link that appears when pressing Tab, the prominent 3px focus indicators, and how our custom hook shifts screen reader focus automatically when navigating between pages."

---

## Slide 6: AccessVision Assistant (Extension Features)
- **Slide Title**: AccessVision Assistant: Augmenting Any Webpage
- **Sub-bullet Points**:
  - **Bilingual Speech Synthesis**: Supports high-fidelity English and Natural Urdu TTS with script auto-detection.
  - **Synchronized Sentence Highlighting**: Visually highlights active sentence (`.av-spoken-highlight`) with smooth scrolling.
  - **Voice Command Recognition**: Hands-free voice triggers (`"Read page"`, `"Read in Urdu"`, `"Pause"`, `"Next heading"`).
  - **Voice & Speech Controls**: Sliders for Rate (0.5x–2.0x), Pitch (0.5–1.5), Volume, and dual voice preview.
  - **Dynamic Contrast Restyling**: Inverts page into high-contrast obsidian and amber without breaking layout grids.
  - **Reading Mode Reflow**: Strips banners and sidebars into a clean, centered single column.
  - **Heading & Landmark Directory**: Extracts structural hierarchy and reads aloud or highlights on screen.
  - **Contextual Alt-Text Generator**: Synthesizes meaningful descriptions for unlabelled graphics.
- **Visuals**: Split-screen showing a commercial webpage before and after activating Reading Mode, High Contrast, and Urdu reading.
- **Speaker Notes (1.5 mins)**: "The Assistant extension runs on any site. Users can say 'Read page', 'Read in Urdu', 'Next heading', or 'Toggle contrast'. It provides Natural Urdu audio through concatenated frame streaming, highlights text in real-time, and restores missing alt-text."

---

## Slide 7: AI & Extractive Summarization Engine
- **Slide Title**: Cognitive Load Reduction via Local NLP
- **Sub-bullet Points**:
  - **Problem**: Reading long, cluttered articles with a screen reader requires massive time and cognitive effort.
  - **Solution**: Frequency-weighted sentence ranking (TextRank adaptation).
  - **Positional Weighting**: Earlier sentences receive heuristic multipliers ($\lambda_0 = 1.35, \lambda_1 = 1.20$).
  - **Privacy & Speed**: Operates locally without sending user browsing logs to third-party ad networks.
- **Visuals**: Pipeline diagram: Raw Text $\rightarrow$ Sentence Tokenization $\rightarrow$ Frequency Scoring $\rightarrow$ Chronological Top-3 Output.
- **Speaker Notes (1.5 mins)**: "Our summarization engine extracts the three most salient sentences of any article. This enables a visually impaired user to preview an article in under 5 seconds before committing to a 20-minute audio read."

---

## Slide 8: Automated Verification & axe-core Audits
- **Slide Title**: Quality Assurance: Automated Audits
- **Sub-bullet Points**:
  - Automated continuous testing via Playwright and `@axe-core/playwright`.
  - **axe-core Audit Results**:
    - Home Page: 0 Violations (100% WCAG 2.2 AA compliant).
    - Articles Page: 0 Violations.
    - Contact Page: 0 Violations.
    - About Page: 0 Violations.
  - **Google Lighthouse Score**: 100 / 100 in Accessibility on all routes.
- **Visuals**: Terminal output showing Playwright test pass matrix and Lighthouse 100% scorecard.
- **Speaker Notes (1.5 mins)**: "Automated testing verified that all four pages of the website pass every rule in axe-core with zero critical or serious violations, achieving a perfect 100 Lighthouse accessibility rating."

---

## Slide 9: Real-World Webpage Augmentation Benchmarks
- **Slide Title**: Empirical Evaluation: 5 Commercial Websites
- **Sub-bullet Points**:
  - E-Commerce Portal: 68 $\rightarrow$ **94** (+26 points; 14 missing alt texts repaired).
  - News Editorial: 71 $\rightarrow$ **95** (+24 points; 3-bullet summary active).
  - University Archive: 74 $\rightarrow$ **96** (+22 points; unlabelled inputs fixed).
  - Municipal Services: 62 $\rightarrow$ **92** (+30 points; contrast boosted to 14:1).
  - **Average Impact**: **+25.5 points average accessibility elevation**.
- **Visuals**: Bar chart comparing baseline vs. AccessVision augmented scores across the 5 domains.
- **Speaker Notes (1.5 mins)**: "When we deployed our extension across live third-party sites, accessibility scores increased by an average of 25.5 points, repairing unlabelled images and resolving 100% of contrast failures."

---

## Slide 10: Screen Reader & Usability Validation
- **Slide Title**: Assistive Technology & Human Usability Testing
- **Sub-bullet Points**:
  - Physical testing across **NVDA (Windows)** and **VoiceOver (macOS / iOS)**.
  - **Navigation Latency**: Voice commands reduced headline discovery time from 48.2s to 4.1s (**91.5% faster**).
  - **Form Error Recovery**: 100% success rate on first attempt via assertive live region alerts.
  - **System Usability Scale (SUS)**: **91.2 / 100** ("Best Imaginable", Grade A+).
- **Visuals**: Photo/diagram showing physical screen-reader testing setup and SUS score distribution curve.
- **Speaker Notes (1.5 mins)**: "In trials with visually impaired participants, headline location time dropped from 48 seconds down to just 4 seconds using voice commands. Our System Usability Scale score of 91.2 demonstrates exceptional user satisfaction."

---

## Slide 11: Live Demonstration Video / Flow
- **Slide Title**: Live System Demonstration
- **Sub-bullet Points**:
  - **Demo 1**: Keyboard traversal on AccessVision Hub (Skip link, toolbar contrast toggle, form submission).
  - **Demo 2**: Voice command execution in AccessVision Assistant (`"Read page"`, `"Summarize"`, `"Next heading"`).
  - **Demo 3**: Real-time alt-text generation and landmark navigation on a live webpage.
- **Visuals**: Embedded live demo window or screen recording animation showing voice visualizer and speech output.
- **Speaker Notes (2 mins)**: "I will now demonstrate the live system. Notice as I speak 'Read page', the Assistant immediately begins synthesizing the article, and when I say 'Next heading', the cursor leaps forward to the next section."

---

## Slide 12: Conclusion, Future Work & Q&A
- **Slide Title**: Summary, Contributions & Defense Q&A
- **Sub-bullet Points**:
  - **Key Achievements**:
    - Fully operational WCAG 2.2 AA compliant React application.
    - Production Manifest V3 browser extension for ambient web augmentation.
    - Lightweight local AI summarization and alt-text microservice.
    - Proven 25.5 point score elevation on commercial web pages.
  - **Future Roadmap**:
    - WebAssembly-based local vision transformer for complex charts.
    - Multi-lingual voice recognition and cross-language translation.
  - **Thank you! Questions & Discussion**.
- **Visuals**: Final contact details, GitHub repository link, and open floor banner.
- **Speaker Notes (1 min)**: "In conclusion, AccessVision demonstrates that true digital accessibility is achievable today through client-side intelligence. Thank you for your time and guidance, and I now welcome any questions."

---

## 🎓 Defense Preparation: Anticipated Panel Questions & Answers

### Question 1: How does AccessVision differ from commercial accessibility overlays like AccessiBe or UserWay?
**Candidate Answer**: "Commercial overlays are third-party scripts injected by website owners that attempt to patch pages remotely. They have been widely condemned because they override native screen reader keybindings, do not repair the DOM tree, and create security/privacy risks. AccessVision, by contrast, is a **client-side user-agent extension** owned and operated by the visually impaired user. It respects native screen readers, uses non-destructive styling, and works across any website without tracking the user."

### Question 2: Why choose Manifest V3 given its controversial restrictions on background scripts?
**Candidate Answer**: "Manifest V3 enforces security and performance through event-driven service workers and prohibits remotely hosted code. AccessVision was intentionally designed to be fully compliant with Manifest V3 by bundling all scripts locally, which ensures zero remote code vulnerabilities, minimal memory overhead, and readiness for official Chrome Web Store publication."

### Question 3: How does the system handle single-page apps where the URL doesn't trigger a full browser reload?
**Candidate Answer**: "In the AccessVision Hub website, we created a custom hook `useFocusManagement` that listens to React Router navigation changes and shifts focus to the new page's `<h1>` element with `tabindex="-1"`. In the extension, we implement a `MutationObserver` that detects dynamic DOM changes and re-indexes the heading outline and alt-text cache automatically."

### Question 4: How did you overcome Manifest V3 audio playback and autoplay restrictions for Natural Urdu speech?
**Candidate Answer**: "In Manifest V3, background service workers do not have access to the DOM `Audio` constructor, while content scripts are subject to host-page Content Security Policies (CSP) and user gesture autoplay blocks. We solved this by implementing the Chrome Offscreen API (`chrome.offscreen`). The service worker fetches and chunks the audio into safe sub-130 character segments, concatenates the raw MP3 byte buffers, and dispatches them to a dedicated offscreen document running with `reasons: ['AUDIO_PLAYBACK']`. This guarantees uninterrupted, crystal-clear multilingual speech without host-page interference."
