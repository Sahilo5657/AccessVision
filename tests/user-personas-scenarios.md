# AccessVision – User Personas & Simulated Testing Scenarios

To ensure human-centered accessibility beyond automated checklists, four representative user personas were designed, each accompanied by realistic browsing tasks and evaluation criteria.

---

## 👤 Persona 1: Marcus – Screen Reader Power User

- **Age**: 28
- **Visual Condition**: Congenitally blind (no functional vision).
- **Assistive Technology**: NVDA on Windows 11 with Firefox/Chrome; iPhone with VoiceOver.
- **Input Method**: Keyboard only (standard QWERTY with dedicated numpad for screen reader review keys).
- **Core Pain Points**: Unlabelled buttons (`<button class="btn-icon">`), images missing alt text, lack of heading landmarks, auto-playing video/audio.

### Testing Scenario & Walkthrough: Marcus
1. **Task**: Find recent articles about Web Content Accessibility Guidelines and contact the authors.
2. **AccessVision Interaction**:
   - Presses `Alt+Shift+V` to open AccessVision Assistant.
   - Activates `"List Headings"` to scan the structure.
   - Hears: *"Heading level 1: AccessVision Articles. Heading level 2: Understanding WCAG 2.2 for Low-Vision Users."*
   - Presses `Enter` to jump straight to the article.
   - Uses the Contact form. Submits without filling email; hears immediate assertive live announcement: *"Error in Email: Please provide a valid email address"*.
   - Focus is shifted to the invalid input. He enters data and successfully submits.

---

## 👤 Persona 2: Elena – Low-Vision & Photophobia Reader

- **Age**: 46
- **Visual Condition**: Advanced Stargardt Disease (macular degeneration with central scotoma and severe sensitivity to white background glare).
- **Assistive Technology**: High-contrast display settings, 250% browser zoom, screen magnifier.
- **Input Method**: Keyboard and trackball mouse.
- **Core Pain Points**: Low-contrast gray text on white, tiny fonts, multi-column layouts requiring horizontal panning, flashing banners.

### Testing Scenario & Walkthrough: Elena
1. **Task**: Read a long academic editorial without experiencing ocular strain or losing reading line position.
2. **AccessVision Interaction**:
   - Presses `Alt+Shift+C` to toggle High Contrast mode.
   - The entire page converts to deep obsidian background (`#090d16`) with high-luminance amber text (`#fbbf24`) having a **15.4:1 contrast ratio**.
   - Presses `Alt+Shift+R` to activate Reading Mode.
   - The multi-column layout reflows into a 70ch single column centered block with 1.8 line spacing.
   - Elena reads comfortably for 30 minutes with zero ocular fatigue.

---

## 👤 Persona 3: David – Senior Citizen with Diabetic Retinopathy & Tremors

- **Age**: 72
- **Visual Condition**: Blurred vision, patchy field loss, mild hand tremors.
- **Assistive Technology**: Built-in OS voice assistant, large font sizes (150%).
- **Input Method**: Voice dictation and mouse.
- **Core Pain Points**: Mouse slips, difficult target clicking (buttons smaller than 44x44px), dense technical text.

### Testing Scenario & Walkthrough: David
1. **Task**: Understand a complex municipal health advisory page.
2. **AccessVision Interaction**:
   - Clicks the microphone icon on the floating AccessVision panel.
   - Speaks aloud: `"Summarize page"`.
   - AccessVision extracts key sentences and reads them aloud using clear natural speech: *"Key takeaway 1: Clinic registrations open Mondays at 8am. Key takeaway 2: Bring government photo identification."*
   - David accomplishes his goal in under 15 seconds without struggling to click tiny links.

---

## 👤 Persona 4: Priya – Temporary Visual Impairment (Post-Ocular Surgery)

- **Age**: 34
- **Visual Condition**: Eyes bandaged/dilated post-LASIK surgery for 48 hours.
- **Assistive Technology**: Temporary reliance on audio-first web browsing.
- **Input Method**: Laptop audio + simple spacebar/voice triggers.
- **Core Pain Points**: Inability to see the screen at all for two days; unfamiliar with complex NVDA key chords.

### Testing Scenario & Walkthrough: Priya
1. **Task**: Listen to morning news updates hands-free.
2. **AccessVision Interaction**:
   - Activates AccessVision Assistant via global shortcut `Alt+Shift+V`.
   - Speaks: `"Read page"`.
   - The extension reads through the primary article text continuously, automatically filtering out advertisements, header links, and footer disclaimers.
   - Priya pauses and resumes speech with the `Spacebar`.

---

## 👤 Persona 5: Zainab – Bilingual Urdu/English Low-Vision Reader

- **Age**: 39
- **Visual Condition**: High myopia with severe astigmatism (-9.5D) and eye strain fatigue.
- **Language Needs**: Reads news in both English and Urdu (Nastaliq script).
- **Assistive Technology**: Screen magnifier, text-to-speech with natural cadence.
- **Input Method**: Keyboard shortcuts and voice triggers.
- **Core Pain Points**: Most screen readers completely lack native Urdu pronunciation or produce unintelligible robotic phonetic output; low-contrast Nastaliq text is difficult to decipher.

### Testing Scenario & Walkthrough: Zainab
1. **Task**: Read a bilingual news portal containing articles in English and Urdu.
2. **AccessVision Interaction**:
   - Opens the AccessVision Assistant panel and sets speech rate to `1.0x`.
   - Clicks `"Read in Urdu"` or speaks: `"اردو میں پڑھیں"`.
   - AccessVision Assistant automatically segments sentences on grammatical boundaries, concatenates high-definition Natural Urdu audio via the Manifest V3 Offscreen Subsystem, and speaks with smooth, natural cadence.
   - Active sentences are highlighted in synchronized amber focus boxes (`.av-spoken-highlight`) with smooth scrolling, allowing Zainab to read along effortlessly.
