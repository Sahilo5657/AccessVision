/**
 * AccessVision Assistant – Popup Controller
 *
 * Coordinates user interaction in the extension popup with the active tab's
 * content script and the background service worker.
 *
 * Features:
 * - Full page reading with language selection (English/Urdu)
 * - Read from selection / current position
 * - Pause / Resume / Stop playback controls
 * - Voice (English & Urdu) selection with preview
 * - Speech rate, pitch, and volume controls
 * - High contrast and reading mode toggles
 * - Heading and landmark navigation
 */

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status');
  const pageTitleEl = document.getElementById('page-title');

  // Reading buttons
  const btnReadFull = document.getElementById('btn-read-full');
  const btnReadSelection = document.getElementById('btn-read-selection');
  const btnReadUrdu = document.getElementById('btn-read-urdu');
  const btnReadEnglish = document.getElementById('btn-read-english');

  // Playback controls
  const btnPause = document.getElementById('btn-pause');
  const btnResume = document.getElementById('btn-resume');
  const btnStop = document.getElementById('btn-stop');
  const btnVoice = document.getElementById('btn-voice');

  // Voice controls
  const speechRateSlider = document.getElementById('popup-speech-rate');
  const speechPitchSlider = document.getElementById('popup-speech-pitch');
  const speechVolumeSlider = document.getElementById('popup-speech-volume');
  const rateValue = document.getElementById('popup-rate-value');
  const pitchValue = document.getElementById('popup-pitch-value');
  const volumeValue = document.getElementById('popup-volume-value');
  const englishVoiceSelect = document.getElementById('popup-english-voice');
  const urduVoiceSelect = document.getElementById('popup-urdu-voice');
  const btnPreviewVoice = document.getElementById('btn-preview-voice');

  // Quick actions
  const btnSummary = document.getElementById('btn-summary');
  const btnContrast = document.getElementById('btn-contrast');
  const btnReading = document.getElementById('btn-reading');

  // Navigation
  const btnPrevHeading = document.getElementById('btn-prev-heading');
  const btnNextHeading = document.getElementById('btn-next-heading');
  const btnHeadings = document.getElementById('btn-headings');
  const btnLandmarks = document.getElementById('btn-landmarks');

  let activeTabId = null;
  let voiceActive = false;

  /**
   * Screen reader status announcement helper
   * @param {string} message
   */
  function announce(message) {
    if (statusEl) {
      statusEl.textContent = '';
      setTimeout(() => {
        statusEl.textContent = message;
      }, 50);
    }
  }

  /**
   * Send message to content script in current active tab
   * @param {object} message
   * @returns {Promise<any>}
   */
  async function sendMessageToTab(message) {
    let tabId = activeTabId;
    if (!tabId) {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (tabs && tabs[0]?.id) {
        tabId = tabs[0].id;
        activeTabId = tabId;
      } else {
        const winTabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (winTabs && winTabs[0]?.id) {
          tabId = winTabs[0].id;
          activeTabId = tabId;
        }
      }
    }

    if (!tabId) {
      announce('No active tab detected');
      return null;
    }

    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch (err) {
      // If content script was not injected or connection failed, attempt to inject on the fly
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content/content-script.js']
        });
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          files: ['content/content-styles.css']
        });
        // Small delay then retry
        await new Promise(r => setTimeout(r, 100));
        return await chrome.tabs.sendMessage(tabId, message);
      } catch (injectErr) {
        console.warn('[AccessVision Popup] Could not message content script:', err);
        announce('Cannot access current page. Please refresh or try a different webpage.');
        return null;
      }
    }
  }

  // ============================================================
  // Populate Voice Selectors
  // ============================================================

  /**
   * Populates the English and Urdu voice dropdown selectors.
   */
  /**
   * Populates the English and Urdu voice dropdown selectors.
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

    // Always provide AccessVision Natural Urdu Cloud voice as the top recommendation
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
  }

  // Load voices (Chrome loads them asynchronously)
  if ('speechSynthesis' in window) {
    populateVoiceSelectors();
    window.speechSynthesis.onvoiceschanged = populateVoiceSelectors;
  }

  // ============================================================
  // Load Current State
  // ============================================================

  // Load current tab and page structure
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      activeTabId = tab.id;
      if (pageTitleEl) {
        pageTitleEl.textContent = tab.title || 'Active Webpage';
      }

      // Check current page settings and structure
      const res = await sendMessageToTab({ action: 'getPageStructure' });
      if (res && res.title && pageTitleEl) {
        pageTitleEl.textContent = res.title;
      }
    }
  } catch (e) {
    if (pageTitleEl) pageTitleEl.textContent = 'Active Webpage';
  }

  // Load initial settings for toggle states and voice controls
  chrome.storage.local.get('avSettings', (data) => {
    const s = data.avSettings || {};

    if (btnContrast && s.highContrast) {
      btnContrast.setAttribute('aria-pressed', 'true');
      btnContrast.classList.add('active');
    }
    if (btnReading && s.readingMode) {
      btnReading.setAttribute('aria-pressed', 'true');
      btnReading.classList.add('active');
    }

    // Restore voice settings
    if (speechRateSlider) {
      speechRateSlider.value = s.speechRate || 1.0;
      rateValue.textContent = `${parseFloat(s.speechRate || 1.0).toFixed(1)}x`;
    }
    if (speechPitchSlider) {
      speechPitchSlider.value = s.speechPitch || 1.0;
      pitchValue.textContent = parseFloat(s.speechPitch || 1.0).toFixed(1);
    }
    if (speechVolumeSlider) {
      speechVolumeSlider.value = s.speechVolume || 1.0;
      volumeValue.textContent = `${Math.round((s.speechVolume || 1.0) * 100)}%`;
    }

    // Restore voice selections
    if (s.englishVoiceName && englishVoiceSelect) {
      englishVoiceSelect.value = s.englishVoiceName;
    }
    if (urduVoiceSelect) {
      urduVoiceSelect.value = s.urduVoiceName || 'online-natural-urdu';
    }
  });

  // ============================================================
  // Save voice settings on change
  // ============================================================

  function saveVoiceSettings() {
    chrome.storage.local.get('avSettings', (data) => {
      const settings = data.avSettings || {};
      settings.speechRate = parseFloat(speechRateSlider?.value || 1.0);
      settings.speechPitch = parseFloat(speechPitchSlider?.value || 1.0);
      settings.speechVolume = parseFloat(speechVolumeSlider?.value || 1.0);
      settings.englishVoiceName = englishVoiceSelect?.value || '';
      settings.urduVoiceName = urduVoiceSelect?.value || 'online-natural-urdu';
      chrome.storage.local.set({ avSettings: settings });
    });
  }

  // Slider event listeners
  speechRateSlider?.addEventListener('input', (e) => {
    rateValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
    saveVoiceSettings();
  });

  speechPitchSlider?.addEventListener('input', (e) => {
    pitchValue.textContent = parseFloat(e.target.value).toFixed(1);
    saveVoiceSettings();
  });

  speechVolumeSlider?.addEventListener('input', (e) => {
    volumeValue.textContent = `${Math.round(parseFloat(e.target.value) * 100)}%`;
    saveVoiceSettings();
  });

  englishVoiceSelect?.addEventListener('change', saveVoiceSettings);
  urduVoiceSelect?.addEventListener('change', saveVoiceSettings);

  // ============================================================
  // Voice Preview
  // ============================================================

  let previewAudio = null;

  btnPreviewVoice?.addEventListener('click', () => {
    window.speechSynthesis.cancel();
    if (previewAudio) {
      try { previewAudio.pause(); } catch (e) {}
      previewAudio = null;
    }

    const voices = window.speechSynthesis.getVoices();

    // 1. Preview English voice
    const engVoiceName = englishVoiceSelect?.value || '';
    const engVoice = engVoiceName ? voices.find(v => v.name === engVoiceName) : null;

    const engUtterance = new SpeechSynthesisUtterance(
      'Welcome to AccessVision. Your cozy reading companion.'
    );
    if (engVoice) {
      engUtterance.voice = engVoice;
      engUtterance.lang = engVoice.lang;
    } else {
      engUtterance.lang = 'en-US';
    }
    engUtterance.rate = parseFloat(speechRateSlider?.value || 1.0);
    engUtterance.pitch = parseFloat(speechPitchSlider?.value || 1.0);
    engUtterance.volume = parseFloat(speechVolumeSlider?.value || 1.0);

    // 2. Play Urdu preview after English
    engUtterance.onend = () => {
      const urduVoiceName = urduVoiceSelect?.value || 'online-natural-urdu';
      const nativeUrduVoice = voices.find(v => v.name === urduVoiceName);

      if (nativeUrduVoice) {
        // Play with native voice
        const urduUtterance = new SpeechSynthesisUtterance(
          'ایکسیس ویژن میں خوش آمدید۔ آپ کا آرام دہ پڑھنے کا ساتھی۔'
        );
        urduUtterance.voice = nativeUrduVoice;
        urduUtterance.lang = nativeUrduVoice.lang;
        urduUtterance.rate = parseFloat(speechRateSlider?.value || 1.0);
        urduUtterance.pitch = parseFloat(speechPitchSlider?.value || 1.0);
        urduUtterance.volume = parseFloat(speechVolumeSlider?.value || 1.0);
        window.speechSynthesis.speak(urduUtterance);
      } else {
        // Play using Online Natural Urdu audio stream
        chrome.runtime.sendMessage(
          { action: 'getAudioTTS', text: 'ایکسیس ویژن میں خوش آمدید۔ آپ کا آرام دہ پڑھنے کا ساتھی۔', lang: 'ur' },
          (resp) => {
            if (resp && resp.audioData) {
              previewAudio = new Audio(resp.audioData);
              previewAudio.playbackRate = parseFloat(speechRateSlider?.value || 1.0);
              previewAudio.volume = parseFloat(speechVolumeSlider?.value || 1.0);
              previewAudio.play().catch(e => console.warn('Preview play error:', e));
            }
          }
        );
      }
    };

    window.speechSynthesis.speak(engUtterance);
    announce('Previewing voices: English then natural Urdu');
  });

  // ============================================================
  // Reading Actions
  // ============================================================

  // Read Full Page
  btnReadFull?.addEventListener('click', async () => {
    announce('Reading full page content');
    await sendMessageToTab({ action: 'readFullPage' });
  });

  // Read Selection
  btnReadSelection?.addEventListener('click', async () => {
    announce('Reading from selection or current position');
    await sendMessageToTab({ action: 'readSelection' });
  });

  // Read in Urdu
  btnReadUrdu?.addEventListener('click', async () => {
    announce('Reading page in Urdu');
    await sendMessageToTab({ action: 'readInUrdu' });
  });

  // Read in English
  btnReadEnglish?.addEventListener('click', async () => {
    announce('Reading page in English');
    await sendMessageToTab({ action: 'readInEnglish' });
  });

  // ============================================================
  // Playback Controls
  // ============================================================

  btnPause?.addEventListener('click', async () => {
    announce('Pausing reading');
    if (previewAudio) {
      try { previewAudio.pause(); } catch (e) {}
    }
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      try { window.speechSynthesis.pause(); } catch (e) {}
    }
    chrome.runtime.sendMessage({ action: 'pauseAudioPlayback' }).catch(() => {});
    await sendMessageToTab({ action: 'pauseReading' });
  });

  btnResume?.addEventListener('click', async () => {
    announce('Resuming reading');
    if (previewAudio && previewAudio.paused && !previewAudio.ended) {
      previewAudio.play().catch(e => {});
    }
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      try { window.speechSynthesis.resume(); } catch (e) {}
    }
    chrome.runtime.sendMessage({ action: 'resumeAudioPlayback' }).catch(() => {});
    await sendMessageToTab({ action: 'resumeReading' });
  });

  btnStop?.addEventListener('click', async () => {
    announce('Speech stopped');
    if (previewAudio) {
      try { previewAudio.pause(); previewAudio.currentTime = 0; } catch (e) {}
      previewAudio = null;
    }
    if (window.speechSynthesis) {
      try { window.speechSynthesis.resume(); } catch (e) {}
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    chrome.runtime.sendMessage({ action: 'stopAudioPlayback' }).catch(() => {});
    await sendMessageToTab({ action: 'stopReading' });
  });

  // Voice Toggle
  btnVoice?.addEventListener('click', async () => {
    voiceActive = !voiceActive;
    btnVoice.setAttribute('aria-pressed', String(voiceActive));
    if (voiceActive) {
      btnVoice.classList.add('active');
      announce('Voice recognition started. Say commands like "Read page" or "Read in Urdu"');
      await sendMessageToTab({ action: 'startVoice' });
    } else {
      btnVoice.classList.remove('active');
      announce('Voice recognition stopped');
      await sendMessageToTab({ action: 'stopVoice' });
    }
  });

  // ============================================================
  // Quick Actions
  // ============================================================

  btnSummary?.addEventListener('click', async () => {
    announce('Generating and speaking page summary');
    await sendMessageToTab({ action: 'summarizePage' });
  });

  btnContrast?.addEventListener('click', async () => {
    const res = await sendMessageToTab({ action: 'toggleHighContrast' });
    const isActive = res?.active;
    btnContrast.setAttribute('aria-pressed', String(isActive));
    if (isActive) {
      btnContrast.classList.add('active');
      announce('High contrast enabled');
    } else {
      btnContrast.classList.remove('active');
      announce('High contrast disabled');
    }
  });

  btnReading?.addEventListener('click', async () => {
    const res = await sendMessageToTab({ action: 'toggleReadingMode' });
    const isActive = res?.active;
    btnReading.setAttribute('aria-pressed', String(isActive));
    if (isActive) {
      btnReading.classList.add('active');
      announce('Reading mode enabled');
    } else {
      btnReading.classList.remove('active');
      announce('Reading mode disabled');
    }
  });

  // ============================================================
  // Navigation
  // ============================================================

  btnPrevHeading?.addEventListener('click', async () => {
    announce('Navigating to previous heading');
    await sendMessageToTab({ action: 'navigateHeading', direction: 'prev' });
  });

  btnNextHeading?.addEventListener('click', async () => {
    announce('Navigating to next heading');
    await sendMessageToTab({ action: 'navigateHeading', direction: 'next' });
  });

  btnHeadings?.addEventListener('click', async () => {
    announce('Listing headings outline');
    await sendMessageToTab({ action: 'listHeadings' });
  });

  btnLandmarks?.addEventListener('click', async () => {
    announce('Listing page landmarks');
    await sendMessageToTab({ action: 'listLandmarks' });
  });
});
