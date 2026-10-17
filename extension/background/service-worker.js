/**
 * AccessVision Assistant – Background Service Worker
 *
 * Handles:
 * - Extension installation and initialization
 * - Keyboard command routing
 * - Message passing between popup and content scripts
 * - Default settings initialization
 * - Text-to-Speech via Chrome TTS API (fallback)
 *
 * Note: Primary TTS now uses Web Speech API directly in the content script
 * for better voice control, Urdu support, and sentence highlighting.
 * Chrome TTS API is retained as a fallback mechanism.
 *
 * @module service-worker
 */

// ============================================================
// Default Settings
// ============================================================

/** Default user preferences stored in chrome.storage.local */
const DEFAULT_SETTINGS = {
  voiceLanguage: 'en-US',
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  englishVoiceName: '',
  urduVoiceName: 'online-natural-urdu',
  highContrast: false,
  readingMode: false,
  autoAltText: true,
  announceChanges: true,
  floatingPanel: true,
  fontSize: 'base', // 'sm' | 'base' | 'lg' | 'xl' | 'xxl'
  enableHighlight: true,
  autoDetectUrdu: true,
  backendApiUrl: 'http://localhost:3001/api',
};

// ============================================================
// Installation Handler
// ============================================================

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Initialize default settings
    await chrome.storage.local.set({ avSettings: DEFAULT_SETTINGS });
    console.log('[AccessVision] Extension installed with default settings.');
  } else if (details.reason === 'update') {
    // Merge new default keys into existing settings (non-destructive upgrade)
    const result = await chrome.storage.local.get('avSettings');
    const existing = result.avSettings || {};
    const merged = { ...DEFAULT_SETTINGS, ...existing };
    await chrome.storage.local.set({ avSettings: merged });
    console.log('[AccessVision] Extension updated. Settings merged with new defaults.');
  }
});

// ============================================================
// Keyboard Command Handler
// ============================================================

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id) return;

  switch (command) {
    case 'toggle-reading-mode':
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleReadingMode',
      });
      break;

    case 'toggle-high-contrast':
      await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleHighContrast',
      });
      break;

    case 'summarize-page':
      await chrome.tabs.sendMessage(tab.id, {
        action: 'summarizePage',
      });
      break;

    default:
      break;
  }
});

// ============================================================
// Offscreen Document Subsystem (Manifest V3 Audio Playback)
// ============================================================

const OFFSCREEN_DOCUMENT_PATH = 'offscreen/offscreen.html';

/**
 * Checks if an offscreen document currently exists.
 * @returns {Promise<boolean>}
 */
async function hasOffscreenDocument() {
  if (chrome.offscreen?.hasDocument) {
    try {
      return await chrome.offscreen.hasDocument();
    } catch (e) {
      return false;
    }
  }
  if (chrome.runtime?.getContexts) {
    try {
      const match = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)],
      });
      return Boolean(match?.length);
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * Ensures the audio offscreen document is created and active.
 */
async function ensureOffscreenDocument() {
  if (await hasOffscreenDocument()) {
    return;
  }
  if (chrome.offscreen?.createDocument) {
    try {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play speech synthesis audio for accessibility without CSP or autoplay restrictions',
      });
    } catch (err) {
      // Ignore if document is already being created concurrently
      if (!err.message?.includes('Only a single offscreen document may be created')) {
        console.warn('[AccessVision] Could not create offscreen document:', err);
      }
    }
  }
}

// ============================================================
// Message Handler
// ============================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getSettings':
      chrome.storage.local.get('avSettings', (result) => {
        sendResponse(result.avSettings || DEFAULT_SETTINGS);
      });
      return true; // Keep channel open for async response

    case 'saveSettings':
      chrome.storage.local.set({ avSettings: message.settings }, () => {
        sendResponse({ success: true });
      });
      return true;

    case 'speak':
      handleSpeak(message.text, message.options || {});
      sendResponse({ success: true });
      break;

    case 'stopSpeaking':
      chrome.tts.stop();
      sendResponse({ success: true });
      break;

    case 'summarize':
      handleSummarize(message.text)
        .then((summary) => sendResponse({ summary }))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    case 'generateAltText':
      handleGenerateAltText(message.src, message.context || '')
        .then((altText) => sendResponse({ altText }))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    case 'getAudioTTS':
      handleGetAudioTTS(message.text, message.lang || 'ur')
        .then((data) => sendResponse(data))
        .catch((err) => sendResponse({ error: err.message }));
      return true;

    case 'playAudioStream':
      handlePlayAudioStream(message)
        .then((res) => sendResponse(res))
        .catch((err) => sendResponse({ success: false, error: err.message }));
      return true;

    case 'pauseAudioPlayback':
      chrome.runtime.sendMessage({ target: 'offscreen', action: 'pause' }).catch(() => {});
      sendResponse({ success: true });
      break;

    case 'resumeAudioPlayback':
      chrome.runtime.sendMessage({ target: 'offscreen', action: 'resume' }).catch(() => {});
      sendResponse({ success: true });
      break;

    case 'stopAudioPlayback':
      chrome.runtime.sendMessage({ target: 'offscreen', action: 'stop' }).catch(() => {});
      sendResponse({ success: true });
      break;

    // Relayed from offscreen.js when audio track finishes
    case 'audioPlaybackEnded':
    case 'audioPlaybackError':
      notifyTabsAudioFinished(message);
      break;

    default:
      break;
  }
});

/**
 * Notifies tabs that offscreen audio playback ended or failed
 * @param {object} message
 */
function notifyTabsAudioFinished(message) {
  chrome.tabs.query({ active: true }, (tabs) => {
    for (const tab of tabs) {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'audioFinished',
          id: message.id,
          error: message.error,
        }).catch(() => {});
      }
    }
  });
}

/**
 * Streams synthesized speech using the offscreen audio player.
 * @param {{text: string, lang?: string, rate?: number, volume?: number, id?: string}} message
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
async function handlePlayAudioStream(message) {
  const { text, lang = 'ur', rate = 1.0, volume = 1.0, id = String(Date.now()) } = message;

  // 1. Fetch TTS audio (chunked and concatenated)
  const ttsResult = await handleGetAudioTTS(text, lang);
  if (!ttsResult || !ttsResult.audioData) {
    throw new Error(ttsResult?.error || 'TTS fetch failed');
  }

  // 2. Ensure offscreen player is active
  await ensureOffscreenDocument();

  // 3. Command offscreen document to play
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        target: 'offscreen',
        action: 'play',
        audioData: ttsResult.audioData,
        rate,
        volume,
        id,
      },
      (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          resolve({
            success: false,
            audioData: ttsResult.audioData, // Provide fallback for in-tab audio
            error: chrome.runtime.lastError?.message || response?.error || 'Offscreen play failed',
          });
        } else {
          resolve({ success: true, id, audioData: ttsResult.audioData });
        }
      }
    );
  });
}

// ============================================================
// Text-to-Speech (Chrome TTS API – fallback)
// ============================================================

/**
 * Speaks the given text using Chrome's TTS API.
 * Primary TTS uses Web Speech API (English) or Offscreen Audio (Urdu).
 *
 * @param {string} text - Text to speak
 * @param {object} options - TTS options (rate, lang)
 */
function handleSpeak(text, options = {}) {
  chrome.tts.stop();

  chrome.storage.local.get('avSettings', (result) => {
    const settings = result.avSettings || DEFAULT_SETTINGS;

    chrome.tts.speak(text, {
      rate: options.rate || settings.speechRate,
      lang: options.lang || settings.voiceLanguage,
      enqueue: false,
    });
  });
}

/**
 * Chunks text by word boundaries so no chunk exceeds maxLen characters.
 * Prevents Google TTS 400 Bad Request errors on long sentences.
 *
 * @param {string} text - Text to chunk
 * @param {number} [maxLen=130] - Max characters per chunk
 * @returns {string[]} Array of safe chunks
 */
function chunkTextForTTS(text, maxLen = 130) {
  if (!text || !text.trim()) return [];
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return [trimmed];

  const words = trimmed.split(/\s+/);
  const chunks = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= maxLen) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) chunks.push(current);
      if (word.length > maxLen) {
        chunks.push(word.substring(0, maxLen));
        current = word.substring(maxLen);
      } else {
        current = word;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

/**
 * Fetches high quality audio speech from the Google Translate TTS service.
 * Automatically chunks sentences on word boundaries and concatenates MP3 audio frames,
 * producing complete, uninterrupted speech of any length without HTTP 400 errors.
 *
 * @param {string} text - Text to speak (Urdu or English)
 * @param {string} lang - Language code ('ur' or 'en')
 * @returns {Promise<{audioData?: string, error?: string}>}
 */
async function handleGetAudioTTS(text, lang = 'ur') {
  if (!text || !text.trim()) {
    return { error: 'Empty text provided' };
  }

  const targetLang = lang.startsWith('ur') ? 'ur' : (lang.startsWith('en') ? 'en' : lang);
  const chunks = chunkTextForTTS(text, 130);
  if (chunks.length === 0) {
    return { error: 'No readable text' };
  }

  const audioBuffers = [];

  for (const chunk of chunks) {
    const endpoints = [
      `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${encodeURIComponent(targetLang)}&q=${encodeURIComponent(chunk)}`,
      `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${encodeURIComponent(targetLang)}&client=tw-ob`,
      `http://localhost:3001/api/tts?lang=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(chunk)}`
    ];

    let chunkBuffer = null;

    for (const url of endpoints) {
      try {
        const response = await fetch(url);
        if (response && response.ok) {
          const ab = await response.arrayBuffer();
          if (ab && ab.byteLength > 100) {
            chunkBuffer = ab;
            break;
          }
        }
      } catch (err) {
        // Try next fallback endpoint
      }
    }

    if (chunkBuffer) {
      audioBuffers.push(chunkBuffer);
    }
  }

  if (audioBuffers.length === 0) {
    return { error: 'All TTS audio endpoints failed to respond' };
  }

  // Concatenate MP3 frames sequentially into a single unified audio buffer
  const totalLength = audioBuffers.reduce((acc, b) => acc + b.byteLength, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of audioBuffers) {
    merged.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  // Convert to base64 Data URL
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < merged.length; i += chunkSize) {
    const chunk = merged.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  const base64 = btoa(binary);
  return { audioData: `data:audio/mp3;base64,${base64}` };
}

// ============================================================
// Page Summarization (Real AI & Extractive Engine)
// ============================================================

/**
 * Generates a summary of the page text content.
 * Queries the AccessVision AI Backend service (OpenAI / HuggingFace),
 * and seamlessly falls back to local frequency-weighted TextRank NLP.
 *
 * @param {string} text - Full page text content
 * @returns {Promise<string>} Summary text
 */
async function handleSummarize(text) {
  if (!text || text.trim().length === 0) {
    return 'No content available to summarize.';
  }

  // Retrieve configured backend endpoint
  const settings = await new Promise((resolve) => {
    chrome.storage.local.get('avSettings', (res) => {
      resolve(res.avSettings || DEFAULT_SETTINGS);
    });
  });

  const apiUrl = (settings.backendApiUrl || 'http://localhost:3001/api').replace(/\/+$/, '');

  // 1. Attempt live AI call to AccessVision backend
  try {
    const response = await fetch(`${apiUrl}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, maxSentences: 3 })
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.data?.summary) {
        return data.data.summary;
      }
    }
  } catch (err) {
    console.info('[AccessVision] Backend service offline, using client-side NLP engine.');
  }

  // 2. Client-side Extractive NLP Fallback Engine
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length === 0) {
    return 'Page content is too short to summarize.';
  }

  const words = text.toLowerCase().split(/\s+/);
  const wordFreq = {};
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
    'it', 'its', 'i', 'you', 'he', 'she', 'we', 'they', 'them', 'their',
    'not', 'no', 'so', 'if', 'as', 'from', 'up', 'out', 'about',
  ]);

  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '');
    if (clean.length > 2 && !stopWords.has(clean)) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  }

  const scored = sentences.map((sentence) => {
    const sentWords = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    for (const w of sentWords) {
      const clean = w.replace(/[^a-z]/g, '');
      score += wordFreq[clean] || 0;
    }
    score = score / sentWords.length;
    return { sentence, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const numSentences = Math.min(3, Math.ceil(sentences.length * 0.2));
  const topSentences = scored.slice(0, numSentences);

  topSentences.sort(
    (a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence)
  );

  return topSentences.map((s) => s.sentence).join('. ') + '.';
}

// ============================================================
// AI Alt-Text Generation (Vision Model & Contextual Analyzer)
// ============================================================

/**
 * Generates accessible alt-text for an image.
 * Queries the AccessVision Vision AI service, falling back to
 * filename and semantic DOM context analysis.
 *
 * @param {string} src - Image source URL
 * @param {string} [context] - Surrounding text context
 * @returns {Promise<string>} Generated alt text
 */
async function handleGenerateAltText(src, context = '') {
  if (!src) return 'Image';

  // Retrieve configured backend endpoint
  const settings = await new Promise((resolve) => {
    chrome.storage.local.get('avSettings', (res) => {
      resolve(res.avSettings || DEFAULT_SETTINGS);
    });
  });

  const apiUrl = (settings.backendApiUrl || 'http://localhost:3001/api').replace(/\/+$/, '');

  // 1. Attempt live Vision AI call to AccessVision backend
  try {
    const response = await fetch(`${apiUrl}/alt-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ src, context })
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.data?.altText) {
        return data.data.altText;
      }
    }
  } catch (err) {
    console.info('[AccessVision] Backend vision service offline, using client-side analyzer.');
  }

  // 2. Client-side Contextual Heuristic Fallback
  try {
    const url = new URL(src, 'http://dummy.base');
    const pathname = url.pathname;
    const filename = pathname.split('/').pop() || '';

    const name = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/\d+/g, '')
      .trim();

    if (name.length > 3) {
      return `Image: ${name.charAt(0).toUpperCase() + name.slice(1)}`;
    }

    if (pathname.includes('logo')) return 'Company logo';
    if (pathname.includes('avatar') || pathname.includes('profile'))
      return 'User profile picture';
    if (pathname.includes('banner') || pathname.includes('hero'))
      return 'Banner illustration';
    if (pathname.includes('icon')) return 'Icon';
    if (pathname.includes('thumbnail') || pathname.includes('thumb'))
      return 'Thumbnail preview';

    return 'Image illustration';
  } catch {
    return 'Image illustration';
  }
}
