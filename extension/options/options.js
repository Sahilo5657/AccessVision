/**
 * AccessVision Assistant – Options Controller
 *
 * Manages user settings persistence in chrome.storage.local
 * and provides test utilities for speech synthesis.
 *
 * New features:
 * - English and Urdu voice selection with auto-population
 * - Speech rate, pitch, and volume controls
 * - Auto-detect Urdu toggle
 * - Text highlight toggle
 * - Voice preview for both English and Urdu
 */

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
  fontSize: 'base',
  enableHighlight: true,
  autoDetectUrdu: true,
  backendApiUrl: 'http://localhost:3001/api',
};

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('settings-form');
  const rateSlider = document.getElementById('speechRate');
  const rateLabel = document.getElementById('rateValue');
  const pitchSlider = document.getElementById('speechPitch');
  const pitchLabel = document.getElementById('pitchValue');
  const volumeSlider = document.getElementById('speechVolume');
  const volumeLabel = document.getElementById('volumeValue');
  const testEnglishBtn = document.getElementById('btn-test-english');
  const testUrduBtn = document.getElementById('btn-test-urdu');
  const resetBtn = document.getElementById('btn-reset');
  const statusEl = document.getElementById('status-message');
  const englishVoiceSelect = document.getElementById('englishVoice');
  const urduVoiceSelect = document.getElementById('urduVoice');

  let testAudio = null;

  function stopTestAudio() {
    if (testAudio) {
      try {
        testAudio.pause();
        testAudio.currentTime = 0;
      } catch (e) {}
      testAudio = null;
    }
  }

  /**
   * Show status message to screen reader and visually
   * @param {string} msg
   * @param {'success' | 'error' | 'info'} type
   */
  function showStatus(msg, type = 'success') {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `status-box visible ${type}`;
    setTimeout(() => {
      statusEl.classList.remove('visible');
    }, 4000);
  }

  /**
   * Populates the voice selector dropdowns with available voices.
   */
  function populateVoiceSelectors() {
    if (!('speechSynthesis' in window)) return;

    const voices = window.speechSynthesis.getVoices();

    // Clear existing options (keep the "Auto" default)
    while (englishVoiceSelect && englishVoiceSelect.options.length > 1) {
      englishVoiceSelect.remove(1);
    }
    while (urduVoiceSelect && urduVoiceSelect.options.length > 1) {
      urduVoiceSelect.remove(1);
    }

    // Always provide AccessVision Natural Urdu Cloud voice
    if (urduVoiceSelect) {
      const onlineUrduOpt = document.createElement('option');
      onlineUrduOpt.value = 'online-natural-urdu';
      onlineUrduOpt.textContent = 'AccessVision Natural Urdu (Cloud/Online) ★';
      urduVoiceSelect.appendChild(onlineUrduOpt);
    }

    if (!voices || voices.length === 0) return;

    // Filter and sort English voices (cozy/natural first)
    const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
    const preferredKeywords = ['natural', 'neural', 'zira', 'samantha', 'jenny', 'aria', 'online', 'google'];
    const avoidKeywords = ['david', 'espeak', 'robotic'];

    englishVoices.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      for (const k of preferredKeywords) {
        if (aName.includes(k)) aScore += 10;
        if (bName.includes(k)) bScore += 10;
      }
      for (const k of avoidKeywords) {
        if (aName.includes(k)) aScore -= 20;
        if (bName.includes(k)) bScore -= 20;
      }
      return bScore - aScore;
    });

    if (englishVoiceSelect) {
      for (const voice of englishVoices) {
        const opt = document.createElement('option');
        opt.value = voice.name;
        opt.textContent = `${voice.name} (${voice.lang})`;
        if (!voice.localService) opt.textContent += ' ★';
        englishVoiceSelect.appendChild(opt);
      }
    }

    // Add native Urdu voices if installed on system
    const nativeUrduVoices = voices.filter(v => {
      const vl = v.lang.toLowerCase();
      return vl.startsWith('ur') || vl.includes('ur-pk') || vl.includes('ur_pk');
    });

    if (urduVoiceSelect) {
      for (const voice of nativeUrduVoices) {
        const opt = document.createElement('option');
        opt.value = voice.name;
        opt.textContent = `${voice.name} (${voice.lang}) [System Voice]`;
        urduVoiceSelect.appendChild(opt);
      }
    }

    // Restore saved selections
    loadSettings();
  }

  // Load voices (Chrome loads them asynchronously)
  if ('speechSynthesis' in window) {
    populateVoiceSelectors();
    window.speechSynthesis.onvoiceschanged = populateVoiceSelectors;
  }

  /**
   * Load saved settings and populate form elements
   */
  function loadSettings() {
    chrome.storage.local.get('avSettings', (result) => {
      const settings = { ...DEFAULT_SETTINGS, ...(result.avSettings || {}) };

      const langSelect = document.getElementById('voiceLanguage');
      if (langSelect) langSelect.value = settings.voiceLanguage;

      if (rateSlider && rateLabel) {
        rateSlider.value = settings.speechRate;
        rateLabel.textContent = `${parseFloat(settings.speechRate).toFixed(1)}x`;
      }

      if (pitchSlider && pitchLabel) {
        pitchSlider.value = settings.speechPitch;
        pitchLabel.textContent = parseFloat(settings.speechPitch).toFixed(1);
      }

      if (volumeSlider && volumeLabel) {
        volumeSlider.value = settings.speechVolume;
        volumeLabel.textContent = `${Math.round(settings.speechVolume * 100)}%`;
      }

      if (englishVoiceSelect && settings.englishVoiceName) {
        englishVoiceSelect.value = settings.englishVoiceName;
      }

      if (urduVoiceSelect) {
        urduVoiceSelect.value = settings.urduVoiceName || 'online-natural-urdu';
      }

      const fontSelect = document.getElementById('fontSize');
      if (fontSelect) fontSelect.value = settings.fontSize;

      const hcBox = document.getElementById('highContrast');
      if (hcBox) hcBox.checked = Boolean(settings.highContrast);

      const rmBox = document.getElementById('readingMode');
      if (rmBox) rmBox.checked = Boolean(settings.readingMode);

      const fpBox = document.getElementById('floatingPanel');
      if (fpBox) fpBox.checked = Boolean(settings.floatingPanel);

      const atBox = document.getElementById('autoAltText');
      if (atBox) atBox.checked = Boolean(settings.autoAltText);

      const acBox = document.getElementById('announceChanges');
      if (acBox) acBox.checked = Boolean(settings.announceChanges);

      const hlBox = document.getElementById('enableHighlight');
      if (hlBox) hlBox.checked = Boolean(settings.enableHighlight);

      const adBox = document.getElementById('autoDetectUrdu');
      if (adBox) adBox.checked = Boolean(settings.autoDetectUrdu);

      const apiInput = document.getElementById('backendApiUrl');
      if (apiInput) apiInput.value = settings.backendApiUrl || DEFAULT_SETTINGS.backendApiUrl;
    });
  }

  // Update slider labels when dragged
  rateSlider?.addEventListener('input', (e) => {
    if (rateLabel) {
      rateLabel.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
    }
  });

  pitchSlider?.addEventListener('input', (e) => {
    if (pitchLabel) {
      pitchLabel.textContent = parseFloat(e.target.value).toFixed(1);
    }
  });

  volumeSlider?.addEventListener('input', (e) => {
    if (volumeLabel) {
      volumeLabel.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
    }
  });

  /**
   * Gets a voice by name from available voices.
   * @param {string} name
   * @returns {SpeechSynthesisVoice|null}
   */
  function getVoiceByName(name) {
    if (!name) return null;
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.name === name) || null;
  }

  // Test English voice button
  testEnglishBtn?.addEventListener('click', () => {
    stopTestAudio();
    if (!('speechSynthesis' in window)) {
      showStatus('Speech synthesis is not supported in this browser.', 'error');
      return;
    }

    window.speechSynthesis.cancel();

    const voiceName = englishVoiceSelect?.value || '';
    const voice = getVoiceByName(voiceName);

    const utterance = new SpeechSynthesisUtterance(
      'Welcome to AccessVision. Your cozy, warm, and friendly reading companion for every webpage.'
    );

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = document.getElementById('voiceLanguage')?.value || 'en-US';
    }

    utterance.rate = parseFloat(rateSlider?.value || '1.0');
    utterance.pitch = parseFloat(pitchSlider?.value || '1.0');
    utterance.volume = parseFloat(volumeSlider?.value || '1.0');

    window.speechSynthesis.speak(utterance);
    showStatus('Playing English voice preview...', 'success');
  });

  // Test Urdu voice button
  testUrduBtn?.addEventListener('click', () => {
    stopTestAudio();
    window.speechSynthesis.cancel();

    const voiceName = urduVoiceSelect?.value || 'online-natural-urdu';
    const voice = getVoiceByName(voiceName);

    if (voice) {
      // Use native system Urdu voice
      const utterance = new SpeechSynthesisUtterance(
        'ایکسیس ویژن میں خوش آمدید۔ آپ کا آرام دہ اور خوشگوار پڑھنے کا ساتھی۔ ہر ویب صفحے کو آسانی سے پڑھیں۔'
      );
      utterance.voice = voice;
      utterance.lang = voice.lang;
      utterance.rate = parseFloat(rateSlider?.value || '1.0');
      utterance.pitch = parseFloat(pitchSlider?.value || '1.0');
      utterance.volume = parseFloat(volumeSlider?.value || '1.0');
      window.speechSynthesis.speak(utterance);
      showStatus('اردو آواز کا نمونہ چل رہا ہے... (Playing Urdu voice preview)', 'success');
    } else {
      // Stream genuine Natural Urdu audio via service worker
      showStatus('آن لائن قدرتی اردو آواز چل رہی ہے... (Streaming Natural Urdu Audio)', 'info');
      chrome.runtime.sendMessage(
        {
          action: 'getAudioTTS',
          text: 'ایکسیس ویژن میں خوش آمدید۔ آپ کا آرام دہ اور خوشگوار پڑھنے کا ساتھی۔ ہر ویب صفحے کو آسانی سے پڑھیں۔',
          lang: 'ur'
        },
        (resp) => {
          if (resp && resp.audioData) {
            testAudio = new Audio(resp.audioData);
            testAudio.playbackRate = parseFloat(rateSlider?.value || '1.0');
            testAudio.volume = parseFloat(volumeSlider?.value || '1.0');
            testAudio.play().catch(e => console.warn('Test audio error:', e));
            showStatus('اردو آواز کا نمونہ چل رہا ہے! (Playing Natural Urdu Speech)', 'success');
          } else {
            showStatus('Could not load online Urdu voice.', 'error');
          }
        }
      );
    }
  });

  // Save settings
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const updatedSettings = {
      voiceLanguage: document.getElementById('voiceLanguage')?.value || 'en-US',
      speechRate: parseFloat(rateSlider?.value || '1.0'),
      speechPitch: parseFloat(pitchSlider?.value || '1.0'),
      speechVolume: parseFloat(volumeSlider?.value || '1.0'),
      englishVoiceName: englishVoiceSelect?.value || '',
      urduVoiceName: urduVoiceSelect?.value || 'online-natural-urdu',
      fontSize: document.getElementById('fontSize')?.value || 'base',
      highContrast: Boolean(document.getElementById('highContrast')?.checked),
      readingMode: Boolean(document.getElementById('readingMode')?.checked),
      floatingPanel: Boolean(document.getElementById('floatingPanel')?.checked),
      autoAltText: Boolean(document.getElementById('autoAltText')?.checked),
      announceChanges: Boolean(document.getElementById('announceChanges')?.checked),
      enableHighlight: Boolean(document.getElementById('enableHighlight')?.checked),
      autoDetectUrdu: Boolean(document.getElementById('autoDetectUrdu')?.checked),
      backendApiUrl: document.getElementById('backendApiUrl')?.value?.trim() || DEFAULT_SETTINGS.backendApiUrl,
    };

    chrome.storage.local.set({ avSettings: updatedSettings }, () => {
      showStatus('✅ Preferences saved successfully!', 'success');
    });
  });

  // Reset settings
  resetBtn?.addEventListener('click', () => {
    chrome.storage.local.set({ avSettings: DEFAULT_SETTINGS }, () => {
      loadSettings();
      showStatus('↺ Preferences reset to default values.', 'success');
    });
  });

  // Initial load
  loadSettings();
});
