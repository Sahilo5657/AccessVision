# AccessVision – Manual Accessibility Testing Checklist & Protocol

This document outlines the rigorous manual testing methodology executed to evaluate the **AccessVision** website and browser extension across desktop and mobile screen readers, high-contrast displays, and keyboard-only interaction.

---

## 🖥️ Screen Readers Evaluated

| Tool | Platform | Browser Tested | Version Tested |
|---|---|---|---|
| **NVDA** (NonVisual Desktop Access) | Windows 11 | Google Chrome, Mozilla Firefox | 2024.1 |
| **JAWS** (Job Access With Speech) | Windows 11 | Google Chrome, Microsoft Edge | 2024 |
| **VoiceOver** | macOS Sonoma | Safari, Google Chrome | 14.4 |
| **VoiceOver** | iOS 17 | Mobile Safari | 17.4 |
| **TalkBack** | Android 14 | Chrome Mobile | 14.1 |

---

## 📋 Comprehensive Test Checklist

### 1. Keyboard Navigation & Focus Flow (WCAG 2.1.1, 2.1.2, 2.4.3, 2.4.7)
- [x] **No Keyboard Traps**: Focus can move freely into, through, and out of all interactive controls (menus, dialogs, forms) without getting stuck (`Tab` and `Shift+Tab`).
- [x] **Visible Focus Indicator**: A 2px to 3px solid focus ring with ≥ 3:1 contrast against surrounding colors is clearly visible on every focused element.
- [x] **Logical Tab Order**: Tab sequence follows the natural reading order (left-to-right, top-to-bottom).
- [x] **Bypass Blocks (Skip Link)**: Pressing `Tab` on initial page load focuses `#skip-link` immediately, and pressing `Enter` moves keyboard focus directly to `<main id="main-content">`.
- [x] **Esc Key Handling**: Modals, dropdown menus, and search palettes close when `Esc` is pressed, restoring focus to the triggering element.

### 2. Semantic Structure & Landmarks (WCAG 1.3.1, 2.4.1, 2.4.6)
- [x] **Landmark Regions**: Page is divided into `<header>` (`banner`), `<nav>` (`navigation`), `<main>` (`main`), and `<footer>` (`contentinfo`).
- [x] **Heading Hierarchy**: Exactly one `<h1>` per page representing the page title, followed hierarchically by `<h2>`, `<h3>` without skipping levels (e.g. `<h2>` directly to `<h4>` never occurs).
- [x] **List Semantics**: Navigation menus and feature grids use semantic `<ul>` / `<ol>` and `<li>` elements, announced as "list with N items" by screen readers.

### 3. Non-Text Content & Alt Text (WCAG 1.1.1)
- [x] **Informative Images**: All diagrams, illustrations, and user avatars provide concise, contextual `alt` descriptions.
- [x] **Decorative Images**: Icons, background graphics, and decorative dividers use `alt=""` or `aria-hidden="true"` so screen readers ignore them cleanly.
- [x] **No Redundant Phrasing**: Alt texts avoid strings like "image of" or "photo showing" because screen readers already announce "graphic".

### 4. Color & Contrast (WCAG 1.4.3, 1.4.1, 1.4.11)
- [x] **Normal Text Contrast**: ≥ 4.5:1 contrast ratio against the background.
- [x] **Large Text Contrast**: ≥ 3.0:1 contrast ratio for text ≥ 18pt (24px) or bold ≥ 14pt (18.66px).
- [x] **User Interface Components**: Form borders, toggles, buttons, and icons have ≥ 3.0:1 contrast against adjacent background colors.
- [x] **Not Color Alone**: Links within body text are underlined or possess a 3:1 luminance difference from body text, plus underline on hover/focus.
- [x] **High Contrast Mode**: Inverted high-contrast black/amber/cyan color schemes maintain ≥ 7:1 contrast throughout.

### 5. Forms & Dynamic Updates (WCAG 3.3.1, 3.3.2, 4.1.2, 4.1.3)
- [x] **Explicit Form Labels**: Every `<input>`, `<textarea>`, and `<select>` has an associated `<label for="...">`.
- [x] **Error Identification**: Invalid inputs are clearly marked with `aria-invalid="true"`.
- [x] **Error Guidance**: Error messages are programmatically linked to fields via `aria-describedby="[id]"`.
- [x] **ARIA Live Announcements**: Status messages, form submissions, and mode toggles use `aria-live="polite"` or `aria-live="assertive"` to immediately notify assistive tech.

### 6. Speech Synthesis & Audio Offscreen Subsystem (Extension)
- [x] **Natural Urdu TTS Playback**: Long Urdu paragraphs are chunked on grammatical boundaries ($\le 130$ chars) and merged into continuous MP3 stream without HTTP 400 errors.
- [x] **Offscreen Audio Document**: Audio playback operates via dedicated offscreen document with reason `AUDIO_PLAYBACK`, avoiding host-page CSP blocking and browser autoplay restrictions.
- [x] **Urdu Unicode Auto-Detection**: Urdu script (`[\u0600-\u06FF]`) detected on mixed pages, seamlessly toggling voice output between English and Urdu.
- [x] **Synchronized Sentence Highlighting**: Reading aloud visually highlights active sentences (`.av-spoken-highlight`) and smoothly scrolls the viewport.
- [x] **Voice Controls**: Speech rate (0.5x–2.0x), pitch (0.5–1.5), and volume (10%–100%) sliders adjust audio dynamically with instant voice preview.
- [x] **Playback State Management**: Pause, Resume, and Stop controls function reliably from popup and content scripts.

---

## 🎙️ Screen Reader Manual Verification Transcript Sample

### NVDA + Google Chrome on AccessVision Website
```text
NVDA Speech Log:
"Skip to main content - link"
[Enter pressed]
"Main landmark. AccessVision - Empowering visual independence through web accessibility - heading level 1"
[Down arrow]
"AccessVision is a unified accessibility suite providing modern accessible components..."
[Tab pressed]
"Explore Articles - link"
[Tab pressed]
"Try Assistant Extension - link"
[Tab pressed]
"Toggle High Contrast mode - button, not pressed"
[Spacebar pressed]
"High contrast enabled - alert. Toggle High Contrast mode - button, pressed"
```

### VoiceOver + Safari (macOS) on AccessVision Assistant Extension
```text
VoiceOver Rotor:
- Headings: 4 found (Quick Actions, Display Modes, Page Navigation, Page Info)
- Landmarks: Banner, Main, Region
- Form Controls: 10 buttons found

VoiceOver Speech Output:
"Read Page - button"
"Summarize - button"
"Voice - toggle button, unselected"
"Contrast - toggle button, unselected"
"Reading - toggle button, unselected"
```
