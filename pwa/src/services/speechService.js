/**
 * AccessVision PWA – Comprehensive Speech Synthesis Engine
 *
 * Capabilities:
 * - Dual-Engine Architecture: Web Speech API (Local) + High-Quality Natural Urdu Cloud Streaming
 * - Smart Voice Filtering: Prioritizes cozy, warm, neural voices (Samantha, Jenny, Aria, Google) over robotic ones
 * - Native Urdu Voice Auto-Detection (ur-PK) + Seamless Cloud Voice Fallback
 * - Word boundary text chunking to prevent TTS timeouts or HTTP 400 errors
 * - Unified Playback Controls: Speak, Pause, Resume, Stop, Rate, Pitch, Volume
 * - Haptic feedback for low-vision and blind users
 */

class SpeechService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.audioPlayer = typeof window !== 'undefined' ? new Audio() : null;
    this.isSpeaking = false;
    this.isPaused = false;
    this.cachedVoices = [];
    this.onEndCallback = null;

    if (this.synth) {
      this.initVoices();
      if (typeof window !== 'undefined') {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }

    if (this.audioPlayer) {
      this.audioPlayer.onended = () => {
        this.isSpeaking = false;
        this.isPaused = false;
        if (this.onEndCallback) this.onEndCallback();
      };
      this.audioPlayer.onerror = (e) => {
        console.warn('[SpeechService] Audio element error:', e);
        this.isSpeaking = false;
        this.isPaused = false;
        if (this.onEndCallback) this.onEndCallback();
      };
    }
  }

  /**
   * Initializes and caches system voices.
   */
  initVoices() {
    if (!this.synth) return [];
    const all = this.synth.getVoices() || [];
    this.cachedVoices = all;
    return all;
  }

  /**
   * Returns list of sorted English voices, prioritizing warm/natural ones.
   */
  getEnglishVoices() {
    if (!this.cachedVoices.length) this.initVoices();
    const en = this.cachedVoices.filter(v => v.lang.toLowerCase().startsWith('en'));

    const preferred = ['natural', 'neural', 'google', 'samantha', 'jenny', 'aria', 'zira', 'karen', 'serena'];
    const avoid = ['david', 'espeak', 'robotic'];

    return [...en].sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      const an = a.name.toLowerCase();
      const bn = b.name.toLowerCase();

      for (const p of preferred) {
        if (an.includes(p)) aScore += 10;
        if (bn.includes(p)) bScore += 10;
      }
      for (const av of avoid) {
        if (an.includes(av)) aScore -= 20;
        if (bn.includes(av)) bScore -= 20;
      }
      return bScore - aScore;
    });
  }

  /**
   * Returns list of available Urdu voices (System + Cloud).
   */
  getUrduVoices() {
    if (!this.cachedVoices.length) this.initVoices();

    const systemUrdu = this.cachedVoices.filter(v => {
      const l = v.lang.toLowerCase();
      return l.startsWith('ur') || l.includes('ur-pk') || l.includes('ur_pk');
    });

    const list = [
      {
        name: 'AccessVision Natural Urdu (Cloud/Online) ★',
        voiceURI: 'online-natural-urdu',
        lang: 'ur-PK',
        isCloud: true,
        recommended: true
      }
    ];

    for (const v of systemUrdu) {
      list.push({
        name: `${v.name} (${v.lang}) [System]`,
        voiceURI: v.voiceURI || v.name,
        lang: v.lang,
        isCloud: false,
        nativeVoice: v
      });
    }

    return list;
  }

  /**
   * Chunks text on word boundaries for cloud TTS.
   * @param {string} text
   * @param {number} maxLen
   * @returns {string[]}
   */
  chunkText(text, maxLen = 130) {
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
   * Speaks a sentence with the requested voice settings.
   *
   * @param {string} text - Sentence or text chunk to speak
   * @param {object} options
   * @param {string} [options.lang='en'] - 'en' or 'ur'
   * @param {number} [options.rate=1.0] - Speed (0.5 to 2.0)
   * @param {number} [options.pitch=1.0] - Pitch (0.5 to 1.5)
   * @param {number} [options.volume=1.0] - Volume (0.1 to 1.0)
   * @param {string} [options.voiceName=''] - Preferred voice name/URI
   * @param {Function} [onEnd] - Callback when sentence finishes
   */
  async speak(text, options = {}, onEnd = null) {
    this.stop(); // Stop any active playback

    if (!text || !text.trim()) {
      if (onEnd) onEnd();
      return;
    }

    this.isSpeaking = true;
    this.isPaused = false;
    this.onEndCallback = onEnd;

    // Trigger haptic vibration on mobile devices
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }

    const {
      lang = 'en',
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      voiceName = ''
    } = options;

    const isUrdu = lang.startsWith('ur');

    // Strategy 1: Natural Urdu Cloud Voice
    if (isUrdu && (voiceName === 'online-natural-urdu' || !voiceName)) {
      try {
        await this.playCloudTts(text, 'ur', rate, volume, onEnd);
        return;
      } catch (err) {
        console.warn('[SpeechService] Cloud Urdu TTS failed, falling back to Web Speech API:', err);
      }
    }

    // Strategy 2: Web Speech API (Local Engine)
    if (!this.synth) {
      console.warn('[SpeechService] Web Speech API not supported in this environment.');
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = Math.max(0.5, Math.min(1.5, pitch));
    utterance.volume = Math.max(0.1, Math.min(1.0, volume));
    utterance.lang = isUrdu ? 'ur-PK' : 'en-US';

    // Find requested voice
    const voices = this.cachedVoices.length ? this.cachedVoices : this.initVoices();
    let selectedVoice = null;

    if (voiceName) {
      selectedVoice = voices.find(v => v.name === voiceName || v.voiceURI === voiceName);
    }

    if (!selectedVoice) {
      if (isUrdu) {
        selectedVoice = voices.find(v => v.lang.toLowerCase().startsWith('ur'));
      } else {
        const enVoices = this.getEnglishVoices();
        selectedVoice = enVoices[0] || null;
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      if (this.onEndCallback) this.onEndCallback();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('[SpeechService] Utterance error:', e.error);
      }
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      if (this.onEndCallback) this.onEndCallback();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Plays cloud TTS audio stream for high-quality natural voices.
   */
  async playCloudTts(text, lang = 'ur', rate = 1.0, volume = 1.0, onEnd = null) {
    const chunks = this.chunkText(text, 120);
    if (!chunks.length) {
      if (onEnd) onEnd();
      return;
    }

    // Play chunks sequentially
    let chunkIndex = 0;

    const playNextChunk = async () => {
      if (!this.isSpeaking || chunkIndex >= chunks.length) {
        this.isSpeaking = false;
        this.isPaused = false;
        if (onEnd) onEnd();
        return;
      }

      const chunk = chunks[chunkIndex++];
      const encoded = encodeURIComponent(chunk);
      const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${lang}&q=${encoded}`;

      this.audioPlayer.src = url;
      this.audioPlayer.playbackRate = Math.max(0.5, Math.min(2.0, rate));
      this.audioPlayer.volume = Math.max(0.1, Math.min(1.0, volume));

      this.audioPlayer.onended = () => {
        playNextChunk();
      };

      try {
        await this.audioPlayer.play();
      } catch (err) {
        console.warn('[SpeechService] Audio play error:', err);
        // If autoplay blocked or fetch failed, fallback to Web Speech
        this.synth.cancel();
        const fallbackUtterance = new SpeechSynthesisUtterance(chunk);
        fallbackUtterance.lang = 'ur-PK';
        fallbackUtterance.rate = rate;
        fallbackUtterance.onend = () => playNextChunk();
        this.synth.speak(fallbackUtterance);
      }
    };

    await playNextChunk();
  }

  /**
   * Pauses current playback.
   */
  pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
    if (this.audioPlayer && !this.audioPlayer.paused) {
      this.audioPlayer.pause();
    }
    this.isPaused = true;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 30, 15]);
    }
  }

  /**
   * Resumes paused playback.
   */
  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
    if (this.audioPlayer && this.audioPlayer.paused && this.isSpeaking) {
      this.audioPlayer.play().catch(() => {});
    }
    this.isPaused = false;
  }

  /**
   * Stops all audio and speech synthesis.
   */
  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.audioPlayer.src = '';
    }
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;
  }
}

export const speechService = new SpeechService();
export default speechService;
