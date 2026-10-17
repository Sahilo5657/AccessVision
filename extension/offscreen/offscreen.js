/**
 * AccessVision Audio Offscreen Subsystem
 *
 * Dedicated audio playback subsystem running in an extension context.
 * Bypasses host-page Content Security Policy (CSP) and is exempt
 * from browser autoplay gesture restrictions (reason: AUDIO_PLAYBACK).
 */

let currentAudio = null;
let currentPlaybackId = null;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.target !== 'offscreen') return;

  switch (message.action) {
    case 'play': {
      // Stop any existing playback
      if (currentAudio) {
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        } catch (e) {}
        currentAudio = null;
      }

      if (!message.audioData) {
        sendResponse({ success: false, error: 'No audio data' });
        return;
      }

      currentPlaybackId = message.id || String(Date.now());
      const playbackId = currentPlaybackId;

      try {
        const audio = new Audio(message.audioData);
        currentAudio = audio;
        audio.playbackRate = parseFloat(message.rate) || 1.0;
        audio.volume = parseFloat(message.volume !== undefined ? message.volume : 1.0);

        audio.onended = () => {
          if (currentPlaybackId === playbackId) {
            currentAudio = null;
            chrome.runtime.sendMessage({
              action: 'audioPlaybackEnded',
              id: playbackId,
            }).catch(() => {});
          }
        };

        audio.onerror = (err) => {
          if (currentPlaybackId === playbackId) {
            currentAudio = null;
            chrome.runtime.sendMessage({
              action: 'audioPlaybackError',
              id: playbackId,
              error: 'Audio playback failed',
            }).catch(() => {});
          }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              sendResponse({ success: true, id: playbackId });
            })
            .catch((err) => {
              if (currentPlaybackId === playbackId) {
                currentAudio = null;
                chrome.runtime.sendMessage({
                  action: 'audioPlaybackError',
                  id: playbackId,
                  error: err.message,
                }).catch(() => {});
              }
              sendResponse({ success: false, error: err.message });
            });
        } else {
          sendResponse({ success: true, id: playbackId });
        }
      } catch (err) {
        currentAudio = null;
        sendResponse({ success: false, error: err.message });
      }
      return true; // Keep response channel open
    }

    case 'pause': {
      if (currentAudio && !currentAudio.paused) {
        try {
          currentAudio.pause();
        } catch (e) {}
      }
      sendResponse({ success: true, paused: true });
      break;
    }

    case 'resume': {
      if (currentAudio && currentAudio.paused && !currentAudio.ended) {
        currentAudio.play().catch(() => {});
      }
      sendResponse({ success: true, playing: true });
      break;
    }

    case 'stop': {
      currentPlaybackId = null;
      if (currentAudio) {
        try {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        } catch (e) {}
        currentAudio = null;
      }
      sendResponse({ success: true, stopped: true });
      break;
    }

    case 'getStatus': {
      sendResponse({
        isPlaying: Boolean(currentAudio && !currentAudio.paused && !currentAudio.ended),
        isPaused: Boolean(currentAudio && currentAudio.paused),
        id: currentPlaybackId,
      });
      break;
    }

    default:
      break;
  }
});
