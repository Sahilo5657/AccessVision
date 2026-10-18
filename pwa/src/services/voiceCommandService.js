/**
 * AccessVision PWA – Voice Command Subsystem
 *
 * Provides hands-free voice navigation for blind & visually impaired users.
 * Uses Web Speech API SpeechRecognition (Chrome, Edge, Safari, Android).
 */

class VoiceCommandService {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.commandCallback = null;
    this.transcriptCallback = null;
    this.statusCallback = null;

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.transcriptCallback) {
          this.transcriptCallback(finalTranscript || interimTranscript);
        }

        if (finalTranscript) {
          this.processCommand(finalTranscript.trim().toLowerCase());
        }
      };

      this.recognition.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn('[VoiceCommandService] Recognition error:', event.error);
        }
      };

      this.recognition.onend = () => {
        // Automatically restart if user hasn't explicitly stopped it
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            // Ignore if already active
          }
        } else {
          if (this.statusCallback) this.statusCallback(false);
        }
      };
    }
  }

  isSupported() {
    return Boolean(this.recognition);
  }

  start(onCommand, onTranscript, onStatusChange) {
    if (!this.recognition) return false;
    this.commandCallback = onCommand;
    this.transcriptCallback = onTranscript;
    this.statusCallback = onStatusChange;

    try {
      this.recognition.start();
      this.isListening = true;
      if (this.statusCallback) this.statusCallback(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([30, 40, 30]);
      }
      return true;
    } catch (err) {
      console.warn('[VoiceCommandService] Start failed:', err);
      return false;
    }
  }

  stop() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.statusCallback) this.statusCallback(false);
  }

  processCommand(raw) {
    const text = raw.toLowerCase().trim();
    let action = null;
    let detail = null;

    if (text.includes('read') || text.includes('start reading') || text.includes('play')) {
      action = 'play';
    } else if (text.includes('pause') || text.includes('wait')) {
      action = 'pause';
    } else if (text.includes('resume') || text.includes('continue')) {
      action = 'resume';
    } else if (text.includes('stop')) {
      action = 'stop';
    } else if (text.includes('next') || text.includes('forward')) {
      action = 'next';
    } else if (text.includes('previous') || text.includes('back')) {
      action = 'previous';
    } else if (text.includes('urdu') || text.includes('اردو')) {
      action = 'set-language';
      detail = 'ur';
    } else if (text.includes('english')) {
      action = 'set-language';
      detail = 'en';
    } else if (text.includes('contrast') || text.includes('high contrast')) {
      action = 'toggle-contrast';
    } else if (text.includes('reading mode') || text.includes('clean view')) {
      action = 'toggle-reading-mode';
    } else if (text.includes('faster') || text.includes('speed up')) {
      action = 'speed-up';
    } else if (text.includes('slower') || text.includes('slow down')) {
      action = 'speed-down';
    } else if (text.includes('bigger') || text.includes('larger font')) {
      action = 'font-up';
    } else if (text.includes('smaller font') || text.includes('shrink font')) {
      action = 'font-down';
    } else if (text.includes('help') || text.includes('commands')) {
      action = 'help';
    }

    if (action && this.commandCallback) {
      this.commandCallback(action, detail, text);
    }
  }
}

export const voiceCommandService = new VoiceCommandService();
export default voiceCommandService;
