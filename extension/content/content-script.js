/**
 * AccessVision Assistant – Content Script
 *
 * Injected into every webpage to provide accessibility enhancements:
 * - Voice command recognition (Web Speech API)
 * - High contrast mode injection
 * - Reading mode injection
 * - Page structure analysis (headings + landmarks)
 * - Alt-text generation for images missing alt attributes
 * - Floating accessible control panel
 * - ARIA improvement injection
 * - Dynamic change announcements
 * - Full page content reading (all semantic elements)
 * - Urdu language detection & voice switching
 * - Sentence-level highlighting during TTS
 * - Pause / Resume / Stop controls
 * - Cozy, warm, natural voice selection
 *
 * All DOM modifications are non-destructive and can be toggled.
 * The extension does NOT override existing accessibility features.
 *
 * @module content-script
 */

// ============================================================
// State Management
// ============================================================

/** @type {boolean} Whether high contrast mode is active */
let highContrastActive = false;

/** @type {boolean} Whether reading mode is active */
let readingModeActive = false;

/** @type {boolean} Whether voice recognition is active */
let voiceActive = false;

/** @type {SpeechRecognition|null} Speech recognition instance */
let recognition = null;

/** @type {boolean} Whether TTS is currently speaking */
let isSpeaking = false;

/** @type {boolean} Whether TTS is currently paused */
let isPaused = false;

/** @type {HTMLElement|null} Reference to the floating panel */
let floatingPanel = null;

/** @type {number} Current heading index for navigation */
let currentHeadingIndex = -1;

/** @type {HTMLElement[]} Cached list of headings */
let headingsCache = [];

/** @type {SpeechSynthesisUtterance|null} Current utterance being spoken */
let currentUtterance = null;

/** @type {HTMLAudioElement|null} Audio element for online natural Urdu TTS */
let currentAudio = null;

/** @type {string|null} Current offscreen audio playback session ID */
let currentPlaybackSessionId = null;

/** @type {Function|null} Callback to execute when offscreen audio ends */
let currentPlaybackEndCallback = null;

/** @type {number|null} Timer ID for speech queue debounce */
let speechStartTimer = null;

/** @type {string} Last non-empty selected text on the page */
let lastSelectedText = '';

/** @type {HTMLElement|null} Last selected element */
let lastSelectedElement = null;

/** @type {object} Cached user preferences */
let cachedSettings = {
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  englishVoiceName: '',
  urduVoiceName: 'online-natural-urdu',
  enableHighlight: true,
  autoDetectUrdu: true,
};

/** @type {Array<{text: string, lang: string, element: HTMLElement|null}>} Queue of text segments to speak */
let speechQueue = [];

/** @type {number} Current index in speechQueue */
let speechQueueIndex = 0;

/** @type {HTMLElement|null} Currently highlighted element during reading */
let currentHighlightEl = null;

/** @type {Array<{text: string, element: HTMLElement|null, lang: string}>} Extracted page segments */
let pageSegments = [];

// Track text selections so clicking popup or buttons does not lose the active selection
document.addEventListener('selectionchange', () => {
  const sel = window.getSelection();
  if (sel) {
    const text = sel.toString().trim();
    if (text.length > 0) {
      lastSelectedText = text;
      lastSelectedElement = sel.anchorNode ? (sel.anchorNode.nodeType === Node.ELEMENT_NODE ? sel.anchorNode : sel.anchorNode.parentElement) : null;
    }
  }
});

// Sync settings updates in real time
if (chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.avSettings) {
      cachedSettings = { ...cachedSettings, ...(changes.avSettings.newValue || {}) };
    }
  });
}

// ============================================================
// Constants
// ============================================================

/**
 * Regex to detect Urdu / Arabic script characters.
 * Covers Arabic Unicode block (U+0600–U+06FF) plus Arabic Supplement.
 */
const URDU_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Elements to skip during page content extraction.
 */
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'SVG', 'CANVAS', 'VIDEO', 'AUDIO',
  'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'META', 'LINK', 'HEAD',
]);

/**
 * Elements that are considered semantic content.
 */
const CONTENT_TAGS = new Set([
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'P', 'LI', 'TD', 'TH', 'BLOCKQUOTE', 'FIGCAPTION',
  'DT', 'DD', 'PRE', 'CODE', 'LABEL', 'LEGEND',
]);

// ============================================================
// Initialization
// ============================================================

/**
 * Initialize the content script when the page loads.
 * Loads saved preferences and sets up event listeners.
 */
function init() {
  // Load settings
  chrome.storage.local.get('avSettings', (result) => {
    const settings = result.avSettings || {};
    cachedSettings = { ...cachedSettings, ...settings };

    if (settings.highContrast) {
      applyHighContrast();
    }

    if (settings.readingMode) {
      applyReadingMode();
    }

    if (settings.floatingPanel !== false) {
      createFloatingPanel();
    }

    if (settings.autoAltText !== false) {
      generateMissingAltTexts();
    }

    // Inject ARIA improvements
    injectARIAImprovements();
  });

  // Cache headings for navigation
  updateHeadingsCache();

  // Set up mutation observer for dynamic content
  setupMutationObserver();
}

// ============================================================
// High Contrast Mode
// ============================================================

/**
 * Applies high-contrast styles to the page.
 * Uses CSS custom properties for consistent theming.
 */
function applyHighContrast() {
  highContrastActive = true;
  document.documentElement.classList.add('av-high-contrast');
  announceToUser('High contrast mode enabled');
}

/**
 * Removes high-contrast styles from the page.
 */
function removeHighContrast() {
  highContrastActive = false;
  document.documentElement.classList.remove('av-high-contrast');
  announceToUser('High contrast mode disabled');
}

/**
 * Toggles high contrast mode on/off.
 */
function toggleHighContrast() {
  if (highContrastActive) {
    removeHighContrast();
  } else {
    applyHighContrast();
  }
  saveSetting('highContrast', highContrastActive);
}

// ============================================================
// Reading Mode
// ============================================================

/**
 * Applies reading mode styles for distraction-free reading.
 */
function applyReadingMode() {
  readingModeActive = true;
  document.documentElement.classList.add('av-reading-mode');
  announceToUser('Reading mode enabled. Showing main content only.');
}

/**
 * Removes reading mode styles.
 */
function removeReadingMode() {
  readingModeActive = false;
  document.documentElement.classList.remove('av-reading-mode');
  announceToUser('Reading mode disabled');
}

/**
 * Toggles reading mode on/off.
 */
function toggleReadingMode() {
  if (readingModeActive) {
    removeReadingMode();
  } else {
    applyReadingMode();
  }
  saveSetting('readingMode', readingModeActive);
}

// ============================================================
// Voice Commands (Web Speech API)
// ============================================================

/**
 * Starts voice command recognition.
 */
function startVoiceCommands() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    announceToUser(
      'Voice commands are not supported in this browser. Please use Chrome or Edge.'
    );
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const last = event.results[event.results.length - 1];
    if (last.isFinal) {
      const command = last[0].transcript.trim().toLowerCase();
      processVoiceCommand(command);
    }
  };

  recognition.onerror = (event) => {
    if (event.error !== 'no-speech') {
      console.warn('[AccessVision] Speech recognition error:', event.error);
    }
  };

  recognition.onend = () => {
    // Restart if still active
    if (voiceActive && recognition) {
      try {
        recognition.start();
      } catch (e) {
        // Already running, ignore
      }
    }
  };

  try {
    recognition.start();
    voiceActive = true;
    announceToUser('Voice commands activated. Say "help" for available commands.');
  } catch (e) {
    announceToUser('Could not start voice recognition. Please check microphone permissions.');
  }
}

/**
 * Stops voice command recognition.
 */
function stopVoiceCommands() {
  if (recognition) {
    voiceActive = false;
    recognition.stop();
    recognition = null;
    announceToUser('Voice commands deactivated');
  }
}

/**
 * Processes a recognized voice command.
 * Supports all original commands plus new ones for Urdu, full page reading, etc.
 *
 * @param {string} command - The recognized voice command text
 */
function processVoiceCommand(command) {
  announceToUser(`Command received: ${command}`);

  // Normalize the command
  const cmd = command.toLowerCase().trim();

  if (cmd.includes('read page') || cmd.includes('read the page') || cmd.includes('read full page')) {
    readFullPageContent();
  } else if (cmd.includes('read from here') || cmd.includes('read selection') || cmd.includes('read selected')) {
    readFromSelection();
  } else if (cmd.includes('read in urdu') || cmd.includes('urdu mode')) {
    readPageInLanguage('ur');
  } else if (cmd.includes('read in english') || cmd.includes('english mode')) {
    readPageInLanguage('en');
  } else if (cmd.includes('pause reading') || cmd.includes('pause')) {
    pauseReading();
  } else if (cmd.includes('resume reading') || cmd.includes('resume') || cmd.includes('continue')) {
    resumeReading();
  } else if (cmd.includes('stop reading') || cmd.includes('stop')) {
    stopReading();
  } else if (cmd.includes('summarize') || cmd.includes('summary')) {
    summarizePage();
  } else if (cmd.includes('next heading')) {
    navigateHeading('next');
  } else if (cmd.includes('previous heading') || cmd.includes('prior heading')) {
    navigateHeading('previous');
  } else if (
    cmd.includes('go to navigation') ||
    cmd.includes('go to nav')
  ) {
    navigateToLandmark('navigation');
  } else if (cmd.includes('go to main') || cmd.includes('go to content')) {
    navigateToLandmark('main');
  } else if (cmd.includes('go to footer')) {
    navigateToLandmark('contentinfo');
  } else if (
    cmd.includes('increase contrast') ||
    cmd.includes('high contrast')
  ) {
    if (!highContrastActive) toggleHighContrast();
  } else if (cmd.includes('normal contrast') || cmd.includes('disable contrast')) {
    if (highContrastActive) toggleHighContrast();
  } else if (cmd.includes('reading mode')) {
    toggleReadingMode();
  } else if (cmd.includes('find forms') || cmd.includes('go to form')) {
    navigateToForms();
  } else if (cmd.includes('list headings') || cmd.includes('show headings')) {
    listHeadings();
  } else if (cmd.includes('list landmarks') || cmd.includes('show landmarks')) {
    listLandmarks();
  } else if (cmd.includes('help') || cmd.includes('commands')) {
    readHelp();
  } else {
    announceToUser(
      `Command "${command}" not recognized. Say "help" for available commands.`
    );
  }
}

// ============================================================
// Full Page Content Extraction
// ============================================================

/**
 * Checks if an element is visible and not hidden/decorative.
 * @param {HTMLElement} el
 * @returns {boolean}
 */
function isElementVisible(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;

  // Skip elements with aria-hidden
  if (el.getAttribute('aria-hidden') === 'true') return false;
  if (el.hidden) return false;

  // Check computed styles for display:none or visibility:hidden
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  if (parseFloat(style.opacity) === 0) return false;

  return true;
}

/**
 * Detects whether text is primarily Urdu/Arabic script.
 * @param {string} text
 * @returns {boolean}
 */
function isUrduText(text) {
  if (!text || text.trim().length === 0) return false;
  // If the text contains ANY Urdu / Arabic script characters, it contains Urdu
  return URDU_REGEX.test(text);
}

/**
 * Detects the language of a text segment.
 * @param {string} text
 * @returns {'ur'|'en'}
 */
function detectTextLanguage(text) {
  return isUrduText(text) ? 'ur' : 'en';
}

/**
 * Extracts all meaningful content from the page in reading order.
 * Returns an array of segments, each with text, source element, and detected language.
 *
 * @param {HTMLElement} [root] - Root element to extract from (defaults to main or body)
 * @returns {Array<{text: string, element: HTMLElement|null, lang: string}>}
 */
function extractPageContent(root) {
  const container = root || document.querySelector('main') ||
                    document.querySelector('[role="main"]') ||
                    document.querySelector('#content') ||
                    document.querySelector('#main-content') ||
                    document.querySelector('.main-content') ||
                    document.body;

  if (!container) return [];

  const segments = [];
  const seenTexts = new Set(); // Deduplicate normalized text

  /**
   * Helper to add a text segment
   * @param {string} rawText
   * @param {HTMLElement|null} el
   * @param {string} [forceLang]
   */
  function addSegment(rawText, el, forceLang) {
    if (!rawText) return;
    const text = rawText.trim();
    if (text.length < 2) return;

    // Normalize for deduplication
    const norm = text.toLowerCase().replace(/\s+/g, ' ');
    if (seenTexts.has(norm)) return;
    seenTexts.add(norm);

    segments.push({
      text,
      element: el,
      lang: forceLang || detectTextLanguage(text),
    });
  }

  /**
   * Recursively walk the DOM tree collecting content.
   * @param {Node} node
   */
  function walk(node) {
    if (!node) return;

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const el = /** @type {HTMLElement} */ (node);
    const tagName = el.tagName;

    // Skip unwanted tags
    if (SKIP_TAGS.has(tagName)) return;

    // Skip hidden elements
    if (!isElementVisible(el)) return;

    // Skip AccessVision's own injected elements
    if (el.id && el.id.startsWith('av-')) return;
    if (el.classList && (el.classList.contains('av-sr-only') || el.classList.contains('av-hidden'))) return;

    // Skip standalone navigation bars (unless specifically scoped)
    if (tagName === 'NAV' || el.getAttribute('role') === 'navigation') return;

    // 1. Headings (H1 - H6)
    if (/^H[1-6]$/.test(tagName)) {
      const headingText = (el.innerText || el.textContent || '').trim();
      if (headingText.length > 0) {
        addSegment(headingText, el);
      }
      return; // Handled heading
    }

    // 2. Images with meaningful alt text
    if (tagName === 'IMG') {
      const alt = el.getAttribute('alt');
      if (alt && alt.trim().length > 0) {
        addSegment(alt.trim(), el);
      }
      return;
    }

    // 3. Buttons
    if (tagName === 'BUTTON' || el.getAttribute('role') === 'button') {
      const btnText = (el.textContent || el.getAttribute('aria-label') || '').trim();
      if (btnText.length > 0 && btnText.length < 150) {
        addSegment(btnText, el);
      }
      return;
    }

    // 4. Form fields
    if (tagName === 'INPUT' || tagName === 'SELECT' || tagName === 'TEXTAREA') {
      const label = el.getAttribute('aria-label') ||
                    el.getAttribute('title') ||
                    el.getAttribute('placeholder') || '';
      if (label.trim().length > 0) {
        addSegment(label.trim(), el);
      }
      return;
    }

    // 5. Links with meaningful text
    if (tagName === 'A') {
      const linkText = (el.textContent || el.getAttribute('aria-label') || '').trim();
      if (linkText.length > 1 && linkText.length < 150) {
        addSegment(linkText, el);
      }
      return;
    }

    // 6. Content-bearing text tags (Paragraphs, List items, Tables, Quotes, Code)
    if (CONTENT_TAGS.has(tagName)) {
      const text = (el.innerText || el.textContent || '').trim();
      if (text.length > 0) {
        // Split longer paragraphs into sentences for responsive highlighting and TTS
        const sentences = splitIntoSentences(text);
        if (sentences.length > 1) {
          for (const sentence of sentences) {
            addSegment(sentence, el);
          }
        } else {
          addSegment(text, el);
        }
      }
      return;
    }

    // 7. Generic container elements (DIV, SECTION, ARTICLE, MAIN, SPAN, etc.)
    // Check if this container has direct text nodes not wrapped in child block elements
    let directText = '';
    let hasChildElements = false;

    for (const child of el.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.textContent.trim();
        if (t.length > 0) {
          directText += (directText ? ' ' : '') + t;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        hasChildElements = true;
      }
    }

    // If container has direct text of its own, extract it
    if (directText.length > 2) {
      const sentences = splitIntoSentences(directText);
      for (const sentence of sentences) {
        addSegment(sentence, el);
      }
    }

    // Recurse into children
    if (hasChildElements) {
      for (const child of el.childNodes) {
        walk(child);
      }
    }
  }

  walk(container);

  // If semantic walk found no content, use fallback body innerText
  if (segments.length === 0) {
    const rawText = (container.innerText || container.textContent || '').trim();
    if (rawText.length > 0) {
      const sentences = splitIntoSentences(rawText);
      for (const s of sentences) {
        addSegment(s, container);
      }
    }
  }

  return segments;
}

/**
 * Splits text into natural sentences for TTS granularity.
 * Handles English (. ! ?), Urdu (۔ ! ؟), and line breaks.
 * @param {string} text
 * @returns {string[]}
 */
function splitIntoSentences(text) {
  if (!text) return [];
  return text
    .split(/(?<=[.!?۔؟\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// ============================================================
// Text-to-Speech Engine (Web Speech + Online Natural Audio)
// ============================================================

/**
 * Finds any native system Urdu voice installed in the browser/OS.
 * @returns {SpeechSynthesisVoice|null}
 */
function getSystemUrduVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;
  return voices.find(v => {
    const vl = v.lang.toLowerCase();
    return vl.startsWith('ur') || vl.includes('ur-pk') || vl.includes('ur_pk');
  }) || null;
}

/**
 * Gets the best available voice for a given language.
 * Strongly prefers natural, warm, cozy voices (e.g. Zira, Google, Natural/Neural)
 * and avoids robotic voices (David, eSpeak).
 *
 * @param {string} lang - Language code ('en', 'ur', etc.)
 * @returns {SpeechSynthesisVoice|null}
 */
function getBestVoice(lang) {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const langNorm = (lang || 'en').toLowerCase();
  const isUrdu = langNorm.startsWith('ur');

  if (isUrdu) {
    const sysUrdu = getSystemUrduVoice();
    if (sysUrdu) return sysUrdu;
    // Try Arabic as phonetic fallback if native Urdu voice is absent
    const arVoice = voices.find(v => v.lang.toLowerCase().startsWith('ar'));
    if (arVoice) return arVoice;
  }

  // English candidates
  const enCandidates = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
  const pool = enCandidates.length > 0 ? enCandidates : voices;

  // Keywords that indicate cozy, natural, pleasant voices
  const preferredKeywords = [
    'natural', 'neural', 'zira', 'samantha', 'jenny', 'aria',
    'karen', 'moira', 'fiona', 'susan', 'hazel', 'online',
    'google us english', 'google uk english female'
  ];

  // Robotic voices to penalize
  const avoidKeywords = ['espeak', 'robotic', 'david', 'mark'];

  const scored = pool.map(voice => {
    let score = 0;
    const nameLower = voice.name.toLowerCase();

    // Prefer online/neural voices
    if (!voice.localService) score += 10;

    // Prefer cozy keywords
    for (const kw of preferredKeywords) {
      if (nameLower.includes(kw)) {
        score += 8;
        break;
      }
    }

    // Penalize robotic voices
    for (const kw of avoidKeywords) {
      if (nameLower.includes(kw)) {
        score -= 25;
        break;
      }
    }

    // Prefer female voices for cozy warmth
    if (nameLower.includes('female') || nameLower.includes('woman') || nameLower.includes('zira')) {
      score += 5;
    }

    // Prefer Google voices
    if (nameLower.includes('google')) {
      score += 4;
    }

    return { voice, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.voice || pool[0] || null;
}

/**
 * Gets the user's preferred voice for a language from settings.
 *
 * @param {string} lang - 'en' or 'ur'
 * @param {object} settings - User settings
 * @returns {SpeechSynthesisVoice|null}
 */
function getPreferredVoice(lang, settings) {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const isUrdu = (lang || '').toLowerCase().startsWith('ur');
  const preferredName = isUrdu ? settings.urduVoiceName : settings.englishVoiceName;

  if (preferredName && preferredName !== 'online-natural-urdu') {
    const match = voices.find(v => v.name === preferredName);
    if (match) return match;
  }

  return getBestVoice(lang);
}

/**
 * Stops any currently playing audio element.
 */
function stopCurrentAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) {}
    currentAudio = null;
  }
}

/**
 * Plays high-quality natural speech via background offscreen audio streaming,
 * with seamless in-tab audio fallback.
 * Exempt from host-page CSP and browser autoplay gesture restrictions.
 *
 * @param {string} text - Text to speak
 * @param {string} lang - Language code ('ur' or 'en')
 * @param {Function} onEnd - Callback when playback finishes
 * @param {Function} onError - Callback when error occurs
 */
function playAudioTTS(text, lang, onEnd, onError) {
  stopCurrentAudio();

  const sessionId = 'tts_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  currentPlaybackSessionId = sessionId;
  currentPlaybackEndCallback = () => {
    if (currentPlaybackSessionId === sessionId) {
      currentPlaybackSessionId = null;
      currentPlaybackEndCallback = null;
      if (onEnd) onEnd();
    }
  };

  const rate = parseFloat(cachedSettings.speechRate) || 1.0;
  const volume = parseFloat(cachedSettings.speechVolume !== undefined ? cachedSettings.speechVolume : 1.0);

  // 1. Primary path: Stream via background offscreen document
  chrome.runtime.sendMessage(
    {
      action: 'playAudioStream',
      text,
      lang: lang || 'ur',
      rate,
      volume,
      id: sessionId,
    },
    (response) => {
      if (!isSpeaking || isPaused) return;

      if (chrome.runtime.lastError || !response || !response.success) {
        // Fallback: in-tab HTMLAudioElement
        const audioData = response?.audioData;
        if (audioData) {
          playAudioInTab(audioData, rate, volume, sessionId, onEnd, onError);
        } else {
          chrome.runtime.sendMessage({ action: 'getAudioTTS', text, lang }, (ttsRes) => {
            if (!isSpeaking || isPaused) return;
            if (ttsRes && ttsRes.audioData) {
              playAudioInTab(ttsRes.audioData, rate, volume, sessionId, onEnd, onError);
            } else {
              if (onError) onError(new Error(ttsRes?.error || 'TTS fetch failed'));
            }
          });
        }
      }
    }
  );
}

/**
 * In-tab audio fallback player if offscreen is unavailable
 */
function playAudioInTab(audioData, rate, volume, sessionId, onEnd, onError) {
  try {
    const audio = new Audio(audioData);
    currentAudio = audio;
    audio.playbackRate = rate;
    audio.volume = volume;

    audio.onended = () => {
      currentAudio = null;
      if (currentPlaybackSessionId === sessionId) {
        currentPlaybackSessionId = null;
        if (onEnd) onEnd();
      }
    };

    audio.onerror = (err) => {
      currentAudio = null;
      if (onError) onError(err);
    };

    audio.play().catch((playErr) => {
      currentAudio = null;
      if (onError) onError(playErr);
    });
  } catch (err) {
    currentAudio = null;
    if (onError) onError(err);
  }
}

/**
 * Starts speaking a queue of segments with proper Chrome cancel debounce.
 * @param {Array<{text: string, element: HTMLElement|null, lang: string}>} segments
 */
function startSpeakingQueue(segments) {
  stopReading();

  if (!segments || segments.length === 0) {
    announceToUser('No readable content found on this page.');
    return;
  }

  speechQueue = segments;
  speechQueueIndex = 0;
  isSpeaking = true;
  isPaused = false;

  // Chrome's window.speechSynthesis.cancel() takes ~50ms to resolve internally.
  // Delaying speak by 75ms ensures Chrome's engine is completely ready and doesn't cancel.
  if (speechStartTimer) clearTimeout(speechStartTimer);
  speechStartTimer = setTimeout(() => {
    if (isSpeaking && !isPaused) {
      speakNextInQueue();
    }
  }, 75);
}

/**
 * Speaks the next item in the speech queue.
 */
function speakNextInQueue() {
  if (!isSpeaking || speechQueueIndex >= speechQueue.length) {
    isSpeaking = false;
    isPaused = false;
    removeHighlight();
    announceToUser('Finished reading.');
    return;
  }

  const item = speechQueue[speechQueueIndex];
  if (!item || !item.text || !item.text.trim()) {
    speechQueueIndex++;
    speakNextInQueue();
    return;
  }

  // Highlight the element currently being read
  if (cachedSettings.enableHighlight !== false && item.element) {
    highlightElement(item.element);
  }

  const textToSpeak = item.text.trim();
  const isUrdu = item.lang === 'ur' || isUrduText(textToSpeak);

  // Check if system has native Urdu voice
  const sysUrduVoice = isUrdu ? getSystemUrduVoice() : null;
  const preferredUrdu = cachedSettings.urduVoiceName || 'online-natural-urdu';

  // If text is Urdu:
  if (isUrdu) {
    // If user explicitly chose a native system Urdu voice that is installed
    if (preferredUrdu !== 'online-natural-urdu' && sysUrduVoice && preferredUrdu === sysUrduVoice.name) {
      speakWithWebSpeech(item);
      return;
    }

    // Otherwise, ALWAYS use the Online Natural Urdu Audio Engine
    playAudioTTS(textToSpeak, 'ur', () => {
      // Audio playback finished successfully
      speechQueueIndex++;
      if (isSpeaking && !isPaused) {
        speakNextInQueue();
      }
    }, (err) => {
      console.warn('[AccessVision] Online Urdu TTS audio failed:', err);
      // NEVER fall back to English voices like Microsoft David for Urdu text!
      // An English voice reads out Unicode codepoints/numbers for Urdu characters.
      if (sysUrduVoice) {
        speakWithWebSpeech(item);
      } else {
        speechQueueIndex++;
        if (isSpeaking && !isPaused) {
          speakNextInQueue();
        }
      }
    });
    return;
  }

  // Otherwise, use Web Speech API (English)
  speakWithWebSpeech(item);
}

/**
 * Speaks an item using the browser Web Speech API.
 * @param {{text: string, element: HTMLElement|null, lang: string}} item
 */
function speakWithWebSpeech(item) {
  if (!window.speechSynthesis) {
    speechQueueIndex++;
    if (isSpeaking && !isPaused) speakNextInQueue();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(item.text);
  currentUtterance = utterance;

  const voice = getPreferredVoice(item.lang, cachedSettings);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = item.lang === 'ur' ? 'ur-PK' : 'en-US';
  }

  utterance.rate = parseFloat(cachedSettings.speechRate) || 1.0;
  utterance.pitch = parseFloat(cachedSettings.speechPitch) || 1.0;
  utterance.volume = parseFloat(cachedSettings.speechVolume !== undefined ? cachedSettings.speechVolume : 1.0);

  utterance.onend = () => {
    currentUtterance = null;
    speechQueueIndex++;
    if (isSpeaking && !isPaused) {
      speakNextInQueue();
    }
  };

  utterance.onerror = (event) => {
    currentUtterance = null;
    if (event.error !== 'interrupted' && event.error !== 'canceled') {
      console.warn('[AccessVision] WebSpeech error:', event.error);
    }
    // Only continue if not explicitly stopped
    if (isSpeaking && !isPaused) {
      speechQueueIndex++;
      speakNextInQueue();
    }
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Speaks a single text string with the detected language.
 * @param {string} text
 * @param {string} [lang='en']
 */
function speakText(text, lang = 'en') {
  const isUrdu = lang === 'ur' || isUrduText(text);
  const sysUrduVoice = isUrdu ? getSystemUrduVoice() : null;
  const preferredUrdu = cachedSettings.urduVoiceName || 'online-natural-urdu';

  if (isUrdu && (preferredUrdu === 'online-natural-urdu' || !sysUrduVoice)) {
    playAudioTTS(text, 'ur', null, null);
    return;
  }

  if (window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getPreferredVoice(lang, cachedSettings);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = isUrdu ? 'ur-PK' : 'en-US';
    }
    utterance.rate = parseFloat(cachedSettings.speechRate) || 1.0;
    utterance.pitch = parseFloat(cachedSettings.speechPitch) || 1.0;
    utterance.volume = parseFloat(cachedSettings.speechVolume !== undefined ? cachedSettings.speechVolume : 1.0);
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Reads the full page content aloud with automatic language detection and voice switching.
 */
function readFullPageContent() {
  pageSegments = extractPageContent();

  if (pageSegments.length === 0) {
    announceToUser('No readable content found on this page.');
    return;
  }

  announceToUser(`Reading page content: ${pageSegments.length} sections found.`);
  startSpeakingQueue(pageSegments);
}

/**
 * Reads the old way — delegates to the full page reader.
 */
function readPageContent() {
  readFullPageContent();
}

/**
 * Reads from the current text selection, or falls back to the current scroll position.
 */
function readFromSelection() {
  // 1. Check window selection
  let selectedText = '';
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    selectedText = selection.toString().trim();
  }

  // 2. Check active input / textarea selection
  if (!selectedText) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      if (typeof start === 'number' && typeof end === 'number' && start !== end) {
        selectedText = activeEl.value.substring(start, end).trim();
      }
    }
  }

  // 3. Check cached lastSelectedText (prevents selection loss when clicking popup)
  if (!selectedText && lastSelectedText) {
    selectedText = lastSelectedText;
  }

  if (selectedText) {
    announceToUser('Reading selected text.');
    const sentences = splitIntoSentences(selectedText);
    const queue = sentences.map(s => ({
      text: s,
      lang: detectTextLanguage(s),
      element: lastSelectedElement
    }));
    startSpeakingQueue(queue);
    return;
  }

  // 4. Fallback: Read from current viewport position
  announceToUser('No text selected. Reading from current page position.');
  pageSegments = extractPageContent();
  if (pageSegments.length === 0) {
    announceToUser('No readable content found on this page.');
    return;
  }

  let startIndex = 0;
  for (let i = 0; i < pageSegments.length; i++) {
    const el = pageSegments[i].element;
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.top >= -50) {
        startIndex = i;
        break;
      }
    }
  }

  const queue = pageSegments.slice(startIndex);
  startSpeakingQueue(queue);
}

/**
 * Reads the entire page forcing a specific language voice.
 * @param {'en'|'ur'} forceLang
 */
function readPageInLanguage(forceLang) {
  pageSegments = extractPageContent();

  if (pageSegments.length === 0) {
    announceToUser('No readable content found.');
    return;
  }

  const langLabel = forceLang === 'ur' ? 'Urdu' : 'English';
  announceToUser(`Reading page in ${langLabel}.`);

  const queue = pageSegments.map(seg => ({
    text: seg.text,
    lang: forceLang,
    element: seg.element,
  }));

  startSpeakingQueue(queue);
}

/**
 * Stops any current TTS playback, audio stream, and clears the queue.
 */
function stopReading() {
  isSpeaking = false;
  isPaused = false;
  speechQueue = [];
  speechQueueIndex = 0;
  currentUtterance = null;
  currentPlaybackSessionId = null;
  currentPlaybackEndCallback = null;

  if (speechStartTimer) {
    clearTimeout(speechStartTimer);
    speechStartTimer = null;
  }

  // 1. Stop background / offscreen audio
  try {
    chrome.runtime.sendMessage({ action: 'stopAudioPlayback' });
  } catch (e) {}

  // 2. Stop in-tab audio
  stopCurrentAudio();

  // 3. Stop Web Speech
  if (window.speechSynthesis) {
    try { window.speechSynthesis.resume(); } catch (e) {}
    try { window.speechSynthesis.cancel(); } catch (e) {}
  }

  removeHighlight();

  try {
    chrome.runtime.sendMessage({ action: 'stopSpeaking' });
  } catch (e) {}

  announceToUser('Speech stopped.');
}

/**
 * Pauses current TTS playback immediately.
 */
function pauseReading() {
  if (isSpeaking && !isPaused) {
    isPaused = true;

    // 1. Pause background / offscreen audio
    try {
      chrome.runtime.sendMessage({ action: 'pauseAudioPlayback' });
    } catch (e) {}

    // 2. Pause in-tab audio if playing
    if (currentAudio) {
      try { currentAudio.pause(); } catch (e) {}
    }

    // 3. Pause Web Speech
    if (window.speechSynthesis) {
      try {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
        }
      } catch (e) {}
    }

    announceToUser('Reading paused.');
  }
}

/**
 * Resumes paused TTS playback from the current sentence.
 */
function resumeReading() {
  if (isPaused) {
    isPaused = false;

    // 1. Resume background / offscreen audio
    try {
      chrome.runtime.sendMessage({ action: 'resumeAudioPlayback' });
    } catch (e) {}

    // 2. Resume in-tab audio if paused mid-stream
    if (currentAudio && currentAudio.paused && !currentAudio.ended) {
      currentAudio.play().catch(() => {
        speakNextInQueue();
      });
      announceToUser('Reading resumed.');
      return;
    }

    // 3. Resume Web Speech if paused
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      try {
        window.speechSynthesis.resume();
        announceToUser('Reading resumed.');
        return;
      } catch (e) {}
    }

    // 4. Otherwise re-speak or advance queue
    if (isSpeaking && !isPaused) {
      speakNextInQueue();
    }

    announceToUser('Reading resumed.');
  }
}

// ============================================================
// Visual Highlight During Reading
// ============================================================

/**
 * Highlights the element currently being read.
 * @param {HTMLElement} el
 */
function highlightElement(el) {
  removeHighlight();

  if (!el) return;

  el.classList.add('av-reading-highlight');
  currentHighlightEl = el;

  // Scroll element into view smoothly
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Removes the current reading highlight.
 */
function removeHighlight() {
  if (currentHighlightEl) {
    currentHighlightEl.classList.remove('av-reading-highlight');
    currentHighlightEl = null;
  }

  // Also remove any stale highlights
  document.querySelectorAll('.av-reading-highlight').forEach(el => {
    el.classList.remove('av-reading-highlight');
  });
}

// ============================================================
// Page Reading & Navigation (Original features preserved)
// ============================================================

/**
 * Requests a summary of the page content from the service worker.
 */
function summarizePage() {
  const main = document.querySelector('main') || document.body;
  const text = main.innerText || main.textContent || '';

  announceToUser('Generating page summary, please wait...');

  chrome.runtime.sendMessage(
    { action: 'summarize', text },
    (response) => {
      if (response && response.summary) {
        announceToUser(`Page summary: ${response.summary}`);
        speakText(`Page summary: ${response.summary}`, detectTextLanguage(response.summary));
      } else {
        announceToUser('Could not generate summary.');
      }
    }
  );
}

/**
 * Navigates to the next or previous heading.
 *
 * @param {'next'|'previous'} direction - Direction to navigate
 */
function navigateHeading(direction) {
  updateHeadingsCache();

  if (headingsCache.length === 0) {
    announceToUser('No headings found on this page.');
    return;
  }

  if (direction === 'next') {
    currentHeadingIndex = Math.min(
      currentHeadingIndex + 1,
      headingsCache.length - 1
    );
  } else {
    currentHeadingIndex = Math.max(currentHeadingIndex - 1, 0);
  }

  const heading = headingsCache[currentHeadingIndex];
  heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
  heading.focus();

  const headingText = (heading.textContent || '').trim();
  const isUrdu = isUrduText(headingText);

  if (isUrdu) {
    announceToUser(`عنوان ${currentHeadingIndex + 1}: ${headingText}`);
  } else {
    const level = heading.tagName.toLowerCase();
    announceToUser(
      `${level}: ${headingText}. Heading ${currentHeadingIndex + 1} of ${headingsCache.length}.`
    );
  }
}

/**
 * Navigates to a specific ARIA landmark.
 *
 * @param {string} landmark - Landmark role to navigate to
 */
function navigateToLandmark(landmark) {
  let element = null;

  switch (landmark) {
    case 'navigation':
      element =
        document.querySelector('nav') ||
        document.querySelector('[role="navigation"]');
      break;
    case 'main':
      element =
        document.querySelector('main') ||
        document.querySelector('[role="main"]');
      break;
    case 'contentinfo':
      element =
        document.querySelector('footer') ||
        document.querySelector('[role="contentinfo"]');
      break;
    case 'banner':
      element =
        document.querySelector('header') ||
        document.querySelector('[role="banner"]');
      break;
    default:
      element = document.querySelector(`[role="${landmark}"]`);
  }

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    element.setAttribute('tabindex', '-1');
    element.focus();
    announceToUser(`Navigated to ${landmark} region.`);
  } else {
    announceToUser(`No ${landmark} landmark found on this page.`);
  }
}

/**
 * Navigates to the first form on the page.
 */
function navigateToForms() {
  const form = document.querySelector('form');
  if (form) {
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const firstInput = form.querySelector(
      'input:not([type="hidden"]), select, textarea'
    );
    if (firstInput) {
      firstInput.focus();
    } else {
      form.setAttribute('tabindex', '-1');
      form.focus();
    }
    announceToUser('Navigated to form.');
  } else {
    announceToUser('No forms found on this page.');
  }
}

/**
 * Lists all headings on the page.
 */
function listHeadings() {
  updateHeadingsCache();

  if (headingsCache.length === 0) {
    announceToUser('No headings found on this page.');
    return;
  }

  const isUrduPage = headingsCache.some((h) => isUrduText(h.textContent || ''));

  if (isUrduPage) {
    const list = headingsCache
      .map((h, i) => `${i + 1}. ${h.textContent.trim()}`)
      .join('۔ ');
    announceToUser(`${headingsCache.length} عنوانات ملے: ${list}`);
  } else {
    const list = headingsCache
      .map(
        (h, i) => `${i + 1}. ${h.tagName}: ${h.textContent.trim()}`
      )
      .join('. ');
    announceToUser(`Found ${headingsCache.length} headings. ${list}`);
  }
}

/**
 * Lists all landmarks on the page.
 */
function listLandmarks() {
  const landmarks = [];

  const selectors = [
    { selector: 'header, [role="banner"]', name: 'Banner' },
    { selector: 'nav, [role="navigation"]', name: 'Navigation' },
    { selector: 'main, [role="main"]', name: 'Main content' },
    { selector: 'aside, [role="complementary"]', name: 'Complementary' },
    { selector: 'footer, [role="contentinfo"]', name: 'Content info' },
    { selector: '[role="search"]', name: 'Search' },
    { selector: 'form, [role="form"]', name: 'Form' },
  ];

  for (const { selector, name } of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      landmarks.push(`${name} (${elements.length})`);
    }
  }

  if (landmarks.length === 0) {
    announceToUser('No landmarks found on this page.');
  } else {
    announceToUser(
      `Found ${landmarks.length} landmark types: ${landmarks.join(', ')}.`
    );
  }
}

/**
 * Reads available voice commands (updated with new commands).
 */
function readHelp() {
  const help = `Available voice commands:
    "Read page" or "Read full page" to read all page content.
    "Read from here" to read from current position or selection.
    "Read in Urdu" to read the page in Urdu.
    "Read in English" to read the page in English.
    "Pause" to pause reading.
    "Resume" or "Continue" to resume reading.
    "Stop reading" to stop speech.
    "Summarize" to get a page summary.
    "Next heading" or "Previous heading" to navigate headings.
    "Go to navigation", "Go to main", or "Go to footer" for landmarks.
    "Increase contrast" or "Normal contrast" for display modes.
    "Reading mode" to toggle reading mode.
    "Find forms" to navigate to forms.
    "List headings" or "List landmarks" for page structure.
    "Help" to hear this message again.`;

  announceToUser(help);
  speakText(help, 'en');
}

// ============================================================
// Alt-Text Generation
// ============================================================

/**
 * Finds images without alt text and generates descriptions.
 */
function generateMissingAltTexts() {
  const images = document.querySelectorAll('img');

  images.forEach((img) => {
    // Skip images that already have meaningful alt text
    if (img.alt && img.alt.trim().length > 0) return;
    // Skip decorative images (empty alt is intentional)
    if (img.hasAttribute('alt') && img.alt === '') return;
    // Skip images with role="presentation"
    if (img.getAttribute('role') === 'presentation') return;

    // Image has no alt attribute at all – generate one
    chrome.runtime.sendMessage(
      { action: 'generateAltText', src: img.src },
      (response) => {
        if (response && response.altText) {
          img.alt = response.altText;
          img.setAttribute('data-av-generated-alt', 'true');
          img.title = `[AccessVision generated] ${response.altText}`;
        }
      }
    );
  });
}

// ============================================================
// ARIA Improvements
// ============================================================

/**
 * Injects ARIA improvements to enhance page accessibility.
 * Only adds attributes that are missing – never overrides existing ones.
 */
function injectARIAImprovements() {
  // Add role="main" to main-like elements if missing
  const mainCandidates = document.querySelectorAll(
    '#main, #content, #main-content, .main-content, [class*="main"]'
  );
  mainCandidates.forEach((el) => {
    if (
      !el.getAttribute('role') &&
      el.tagName !== 'MAIN' &&
      !document.querySelector('main')
    ) {
      el.setAttribute('role', 'main');
    }
  });

  // Ensure buttons have accessible names
  const buttons = document.querySelectorAll(
    'button:not([aria-label]):not([aria-labelledby])'
  );
  buttons.forEach((btn) => {
    if (!btn.textContent || btn.textContent.trim().length === 0) {
      // Button has no text – check for icon
      const img = btn.querySelector('img, svg');
      if (img && !btn.getAttribute('aria-label')) {
        btn.setAttribute('aria-label', 'Button (unlabelled)');
        btn.setAttribute('data-av-needs-label', 'true');
      }
    }
  });

  // Ensure links have discernible text
  const links = document.querySelectorAll('a[href]');
  links.forEach((link) => {
    if (
      !link.textContent?.trim() &&
      !link.getAttribute('aria-label') &&
      !link.querySelector('img[alt]')
    ) {
      link.setAttribute('aria-label', 'Link (unlabelled)');
      link.setAttribute('data-av-needs-label', 'true');
    }
  });

  // Mark form inputs without labels
  const inputs = document.querySelectorAll(
    'input:not([type="hidden"]), select, textarea'
  );
  inputs.forEach((input) => {
    const id = input.id;
    const hasLabel =
      id && document.querySelector(`label[for="${id}"]`);
    const hasAriaLabel =
      input.getAttribute('aria-label') ||
      input.getAttribute('aria-labelledby');
    const hasTitle = input.getAttribute('title');
    const hasPlaceholder = input.getAttribute('placeholder');

    if (!hasLabel && !hasAriaLabel && !hasTitle) {
      if (hasPlaceholder) {
        input.setAttribute('aria-label', hasPlaceholder);
      } else {
        input.setAttribute('data-av-needs-label', 'true');
      }
    }
  });
}

// ============================================================
// Floating Control Panel
// ============================================================

/**
 * Creates the floating AccessVision control panel.
 */
function createFloatingPanel() {
  if (floatingPanel) return;

  floatingPanel = document.createElement('div');
  floatingPanel.id = 'av-floating-panel';
  floatingPanel.setAttribute('role', 'toolbar');
  floatingPanel.setAttribute('aria-label', 'AccessVision controls');
  floatingPanel.innerHTML = `
    <button id="av-toggle-panel" aria-label="Toggle AccessVision control panel" aria-expanded="false" title="AccessVision Controls">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
    </button>
    <div id="av-panel-content" class="av-hidden" role="group" aria-label="Accessibility controls">
      <button id="av-btn-voice" aria-pressed="false" title="Toggle voice commands">🎤 Voice</button>
      <button id="av-btn-read" title="Read full page content">📖 Read Full Page</button>
      <button id="av-btn-read-selection" title="Read selected text or from current position">📝 Read Selection</button>
      <button id="av-btn-summary" title="Summarize page">📄 Summary</button>
      <button id="av-btn-contrast" aria-pressed="false" title="Toggle high contrast">🌓 Contrast</button>
      <button id="av-btn-reading-mode" aria-pressed="false" title="Toggle reading mode">📚 Reading</button>
      <button id="av-btn-headings" title="List page headings">📋 Headings</button>
      <button id="av-btn-landmarks" title="List page landmarks">🗺️ Landmarks</button>
      <button id="av-btn-pause" title="Pause reading">⏸️ Pause</button>
      <button id="av-btn-resume" title="Resume reading">▶️ Resume</button>
      <button id="av-btn-stop" title="Stop speaking">⏹️ Stop</button>
    </div>
  `;

  document.body.appendChild(floatingPanel);

  // Panel toggle
  const toggleBtn = document.getElementById('av-toggle-panel');
  const panelContent = document.getElementById('av-panel-content');

  toggleBtn.addEventListener('click', () => {
    const expanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', String(!expanded));
    panelContent.classList.toggle('av-hidden');
  });

  // Button event listeners
  document.getElementById('av-btn-voice').addEventListener('click', () => {
    if (voiceActive) {
      stopVoiceCommands();
      document.getElementById('av-btn-voice').setAttribute('aria-pressed', 'false');
    } else {
      startVoiceCommands();
      document.getElementById('av-btn-voice').setAttribute('aria-pressed', 'true');
    }
  });

  document.getElementById('av-btn-read').addEventListener('click', readFullPageContent);
  document.getElementById('av-btn-read-selection').addEventListener('click', readFromSelection);
  document.getElementById('av-btn-summary').addEventListener('click', summarizePage);

  document.getElementById('av-btn-contrast').addEventListener('click', () => {
    toggleHighContrast();
    document
      .getElementById('av-btn-contrast')
      .setAttribute('aria-pressed', String(highContrastActive));
  });

  document.getElementById('av-btn-reading-mode').addEventListener('click', () => {
    toggleReadingMode();
    document
      .getElementById('av-btn-reading-mode')
      .setAttribute('aria-pressed', String(readingModeActive));
  });

  document.getElementById('av-btn-headings').addEventListener('click', listHeadings);
  document.getElementById('av-btn-landmarks').addEventListener('click', listLandmarks);
  document.getElementById('av-btn-pause').addEventListener('click', pauseReading);
  document.getElementById('av-btn-resume').addEventListener('click', resumeReading);
  document.getElementById('av-btn-stop').addEventListener('click', stopReading);
}

// ============================================================
// Utility Functions
// ============================================================

/**
 * Updates the cached list of headings on the page.
 */
function updateHeadingsCache() {
  headingsCache = Array.from(
    document.querySelectorAll('h1, h2, h3, h4, h5, h6')
  );
}

/**
 * Announces a message to the user via an ARIA live region.
 *
 * @param {string} message - Message to announce
 */
function announceToUser(message) {
  let liveRegion = document.getElementById('av-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'av-live-region';
    liveRegion.setAttribute('aria-live', 'assertive');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.setAttribute('role', 'status');
    liveRegion.className = 'av-sr-only';
    document.body.appendChild(liveRegion);
  }

  // Clear and re-set to trigger announcement
  liveRegion.textContent = '';
  setTimeout(() => {
    liveRegion.textContent = message;
  }, 50);
}

/**
 * Saves a setting to chrome.storage.
 *
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 */
function saveSetting(key, value) {
  chrome.storage.local.get('avSettings', (result) => {
    const settings = result.avSettings || {};
    settings[key] = value;
    chrome.storage.local.set({ avSettings: settings });
  });
}

// ============================================================
// Mutation Observer – Dynamic Content Changes
// ============================================================

/**
 * Sets up a MutationObserver to handle dynamic page changes.
 * Announces significant DOM changes to screen readers.
 */
function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    let hasNewContent = false;

    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            !node.id?.startsWith('av-') &&
            !node.classList?.contains('av-sr-only')
          ) {
            // Check if the added element has significant content
            const text = node.textContent?.trim();
            if (text && text.length > 50) {
              hasNewContent = true;
            }

            // Generate alt text for new images
            if (node.tagName === 'IMG' && !node.alt) {
              chrome.runtime.sendMessage(
                { action: 'generateAltText', src: node.src },
                (response) => {
                  if (response?.altText) {
                    node.alt = response.altText;
                    node.setAttribute('data-av-generated-alt', 'true');
                  }
                }
              );
            }
          }
        }
      }
    }

    if (hasNewContent) {
      // Update headings cache when content changes
      updateHeadingsCache();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// ============================================================
// Ensure voices are loaded
// ============================================================

/**
 * Pre-load voices when they become available.
 * Chrome loads voices asynchronously.
 */
if (window.speechSynthesis) {
  window.speechSynthesis.getVoices(); // Trigger initial load
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices(); // Cache voices
  };
}

// ============================================================
// Message Handler (from popup/background)
// ============================================================

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.action) {
    case 'toggleHighContrast':
      toggleHighContrast();
      sendResponse({ active: highContrastActive });
      break;

    case 'toggleReadingMode':
      toggleReadingMode();
      sendResponse({ active: readingModeActive });
      break;

    case 'readPage':
      readFullPageContent();
      sendResponse({ success: true });
      break;

    case 'readFullPage':
      readFullPageContent();
      sendResponse({ success: true });
      break;

    case 'readSelection':
      readFromSelection();
      sendResponse({ success: true });
      break;

    case 'readInUrdu':
      readPageInLanguage('ur');
      sendResponse({ success: true });
      break;

    case 'readInEnglish':
      readPageInLanguage('en');
      sendResponse({ success: true });
      break;

    case 'stopReading':
      stopReading();
      sendResponse({ success: true });
      break;

    case 'pauseReading':
      pauseReading();
      sendResponse({ success: true });
      break;

    case 'resumeReading':
      resumeReading();
      sendResponse({ success: true });
      break;

    case 'audioFinished':
      if (currentPlaybackSessionId && message.id === currentPlaybackSessionId) {
        if (typeof currentPlaybackEndCallback === 'function') {
          currentPlaybackEndCallback();
        }
      }
      sendResponse({ received: true });
      break;

    case 'summarizePage':
      summarizePage();
      sendResponse({ success: true });
      break;

    case 'startVoice':
      startVoiceCommands();
      sendResponse({ success: true });
      break;

    case 'stopVoice':
      stopVoiceCommands();
      sendResponse({ success: true });
      break;

    case 'navigateHeading':
      navigateHeading(message.direction || 'next');
      sendResponse({ success: true });
      break;

    case 'navigateToLandmark':
      navigateToLandmark(message.landmark);
      sendResponse({ success: true });
      break;

    case 'listHeadings':
      listHeadings();
      sendResponse({ success: true });
      break;

    case 'listLandmarks':
      listLandmarks();
      sendResponse({ success: true });
      break;

    case 'getPageStructure':
      updateHeadingsCache();
      const structure = {
        headings: headingsCache.map((h) => ({
          level: h.tagName,
          text: h.textContent?.trim(),
        })),
        title: document.title,
        url: window.location.href,
      };
      sendResponse(structure);
      break;

    default:
      break;
  }
});

// ============================================================
// Start
// ============================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
