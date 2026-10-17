# AccessVision User Manual & Operating Guide
## A Complete Practical Guide for Visually Impaired Users, Caregivers, & Evaluators

**System Components Covered:** AccessVision Hub (Website) & AccessVision Assistant (Extension)  
**Document Version:** 1.0.0  

---

## 1. Introduction & Welcome

Welcome to **AccessVision**, a comprehensive accessibility system designed to provide blind, low-vision, and motor-impaired individuals with an autonomous, barrier-free web browsing experience.

AccessVision provides two complementary tools:
1. **AccessVision Hub**: A demonstration website built to full WCAG 2.2 AA standards, showcasing accessible articles, forms, and custom display controls.
2. **AccessVision Assistant**: A powerful browser extension that adds voice commands, high contrast, distracted-free reading, and spoken outlines to **any website on the internet**.

---

## 2. Navigating the AccessVision Hub (Website)

### 2.1 Keyboard Navigation Fundamentals
You do not need a mouse to navigate any part of AccessVision. Use these standard keyboard shortcuts:

| Key / Shortcut | Action | Description |
|---|---|---|
| `Tab` | Move forward | Focuses next link, button, or form field. |
| `Shift + Tab` | Move backward | Focuses previous interactive element. |
| `Enter` | Activate link / submit | Opens links, submits forms, or triggers actions. |
| `Spacebar` | Toggle button | Toggles switches, checkboxes, or buttons. |
| `Esc` | Close | Closes opened mobile menus or dialogs. |

### 2.2 Using the Skip Navigation Link
When a page loads, the very first `Tab` press highlights the **"Skip to main content"** link at the top-left of the viewport. Pressing `Enter` bypasses the entire header navigation and moves focus directly to the main article heading (`<h1>`).

### 2.3 Using the On-Site Accessibility Toolbar
Located on the right side of the screen is the AccessVision Toolbar:
- **🌓 Contrast Toggle**: Inverts the website into a high-contrast dark theme with bright amber text and deep black background (contrast ratio > 14:1).
- **🔤 Font Sizing (A- / A+)**: Scales the typography up to 200% without causing horizontal page scrolling.
- **📚 Reading Mode**: Strips away header banners, footers, and sidebars, presenting pure article text in a single, high-readability column.

### 2.4 Submitting the Accessible Contact Form
- Every input field includes clear labels and helper text.
- If a required field is empty or improperly formatted, an **Error Summary Alert** appears at the top of the form, announces the exact problem via your screen reader, and shifts focus directly to the first input needing correction.

---

## 3. Using the AccessVision Assistant (Browser Extension)

### 3.1 Installation in Google Chrome or Microsoft Edge
1. Open Chrome or Edge.
2. In the URL address bar, enter `chrome://extensions` (or `edge://extensions`).
3. Turn on the **Developer mode** toggle in the top-right corner.
4. Click the **Load unpacked** button in the top-left corner.
5. In the file picker dialog, select the `AccessVision/extension` directory and click **Select Folder**.
6. The AccessVision eye icon will appear in your browser toolbar. Click the puzzle icon and select the pin icon next to AccessVision for quick access.

### 3.2 Global Keyboard Shortcuts
Control the extension from anywhere in your browser without touching the mouse:

| Shortcut | Action |
|---|---|
| `Alt + Shift + V` | Open the AccessVision Assistant control popup. |
| `Alt + Shift + C` | Toggle High Contrast mode on the active web page. |
| `Alt + Shift + R` | Toggle Distraction-Free Reading Mode on the active web page. |
| `Alt + Shift + S` | Generate and speak a 3-bullet page summary. |

---

## 4. Complete Voice Command Dictionary

AccessVision Assistant includes a built-in speech recognition engine. Click the **🎤 Voice** button or press the microphone icon on the floating on-screen panel, then speak naturally:

```text
========================================================================
 Spoken Phrase                  Action Executed by AccessVision
========================================================================
 "Read page" / "Read article"   Reads full page aloud with sentence highlighting
 "Read in Urdu" / "اردو میں"     Reads the page using AccessVision Natural Urdu TTS
 "Read in English"              Reads the page using selected English voice
 "Pause"                        Pauses active speech synthesis / audio stream
 "Resume"                       Resumes speech playback from paused location
 "Stop" / "Silence"             Immediately halts speech and clears highlights
 "Summarize"                    Speaks the 3 most important key takeaways
 "Next heading"                 Jumps focus and scrolls to the next heading (h1-h6)
 "Previous heading"             Jumps focus to the previous heading
 "Contrast" / "Toggle contrast" Activates or deactivates high-contrast mode (≥ 7:1)
 "Reading mode"                 Enables clutter-free, single-column reading view
 "List headings"                Speaks the total count and list of headings
 "List landmarks"               Announces page navigation, main, and footers
========================================================================
```

### 4.1 Synchronized Visual Follow-Along (Sentence Highlighting)
While reading aloud, AccessVision highlights the sentence currently being spoken with an amber focus box (`.av-spoken-highlight`) and smoothly scrolls the viewport to keep the reading location in center view. This assists users with partial vision, dyslexia, or cognitive fatigue in following along seamlessly.

---

## 5. Customizing Extension Settings (Options Page & Popup)

To personalize AccessVision:
1. Right-click the AccessVision toolbar icon and select **Options** (or open the popup and click the settings sliders).
2. Configure your preferences:
   - **Speech Language**: Choose default locale (English, Urdu, Spanish, French, German, Arabic).
   - **Preferred English Voice**: Select warm, natural human voices (prioritized with ★ for high quality).
   - **Preferred Urdu Voice**: Choose **AccessVision Natural Urdu (Cloud/Online) ★** or system-installed Windows Urdu voices.
   - **Speech Rate Slider**: Slide from `0.5x` (deliberate) to `2.0x` (rapid navigation).
   - **Speech Pitch Slider**: Adjust pitch from `0.5` (deep) to `1.5` (high).
   - **Speech Volume Slider**: Adjust loudness from `10%` to `100%`.
   - **Voice Preview Button**: Click **🔊 Test Voices** to hear an instant sample in English followed by Urdu.
   - **Auto-Detect Urdu**: Automatically recognizes Urdu script (`[\u0600-\u06FF]`) on bilingual websites and switches voice mid-page.
   - **Default Modes**: Set High Contrast or Reading Mode to automatically apply whenever any webpage loads.
   - **Auto Alt-Text**: Enable automatic generation of image descriptions for unlabelled web graphics.
   - **Backend API URL**: Optionally point to `http://localhost:3001/api` for extended NLP and vision models.
3. Click **💾 Save Preferences**. Changes take effect immediately across all open tabs.

---

## 6. Troubleshooting & Frequently Asked Questions (FAQ)

### Q: Why didn't voice recognition start when I clicked Voice?
**A**: Ensure your browser has permission to access your microphone. Click the lock/tune icon on the left side of your browser address bar and verify that **Microphone** is set to **Allow**.

### Q: Does AccessVision interfere with my NVDA or VoiceOver screen reader?
**A**: No. AccessVision uses non-intrusive standard ARIA live regions and browser speech synthesis. If you are using NVDA, you can use AccessVision’s voice commands for quick navigation while letting NVDA read specific text blocks.

### Q: How do I turn off the floating on-screen panel?
**A**: Go to the extension **Options** page, uncheck "Display floating accessibility control panel on pages", and click **Save Preferences**.

### Q: Can I run the backend on a machine without Node.js installed?
**A**: Yes! The backend includes a standalone, zero-dependency Python server (`backend/server.py`) that runs out of the box on standard Python 3.8+ without installing any npm or pip packages. Simply run `python server.py`.
