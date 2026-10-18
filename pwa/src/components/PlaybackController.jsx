import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  Gauge,
  Sliders,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { usePlayback } from '../contexts/PlaybackContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import speechService from '../services/speechService';

export default function PlaybackController() {
  const {
    sentences,
    currentSentenceIndex,
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop,
    nextSentence,
    prevSentence,
    languageMode
  } = usePlayback();

  const {
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    speechVolume,
    setSpeechVolume,
    englishVoiceName,
    setEnglishVoiceName,
    urduVoiceName,
    setUrduVoiceName,
    announce
  } = useAccessibility();

  const [expandedSettings, setExpandedSettings] = useState(false);
  const [englishVoices, setEnglishVoices] = useState([]);
  const [urduVoices, setUrduVoices] = useState([]);

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const en = speechService.getEnglishVoices();
      const ur = speechService.getUrduVoices();
      setEnglishVoices(en);
      setUrduVoices(ur);
    };

    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const currentSentence = sentences[currentSentenceIndex]?.text || 'No text loaded';

  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      pause();
    } else if (isPlaying && isPaused) {
      resume();
    } else {
      play(currentSentenceIndex);
    }
  };

  const handlePreviewVoice = (isUrdu = false) => {
    const sampleText = isUrdu
      ? 'السلام علیکم! میں ایکسیس ویژن ہوں، آپ کا قدرتی اردو معاون۔'
      : 'Hello! I am AccessVision, your cozy and natural accessible reading companion.';

    announce(isUrdu ? 'اردو آواز کا جائزہ لیا جا رہا ہے' : 'Testing English voice preview');

    speechService.speak(
      sampleText,
      {
        lang: isUrdu ? 'ur' : 'en',
        rate: speechRate,
        pitch: speechPitch,
        volume: speechVolume,
        voiceName: isUrdu ? urduVoiceName : englishVoiceName
      }
    );
  };

  return (
    <nav
      className="playback-dock"
      role="region"
      aria-label="Audio playback and speech controls"
    >
      <div className="dock-inner">
        {/* Main Playback Bar Row */}
        <div className="dock-main-row">
          {/* Active Speaking Indicator & Text Preview */}
          <div className="dock-current-reading">
            <span
              className={`speaking-indicator ${isPlaying && !isPaused ? 'speaking' : ''}`}
              aria-hidden="true"
            />
            <div className="dock-text-preview" title={currentSentence}>
              <span className="sr-only">Currently reading: </span>
              {currentSentence}
            </div>
          </div>

          {/* Core Large Playback Buttons */}
          <div className="playback-controls-group" role="toolbar" aria-label="Playback actions">
            {/* Prev Sentence */}
            <button
              type="button"
              className="playback-btn"
              onClick={prevSentence}
              disabled={currentSentenceIndex <= 0}
              aria-label="Previous Sentence"
              title="Previous Sentence (Left Arrow)"
            >
              <SkipBack size={20} aria-hidden="true" />
            </button>

            {/* Play / Pause Primary Button */}
            <button
              type="button"
              className="playback-btn play-pause-big"
              onClick={handlePlayPause}
              aria-label={
                isPlaying && !isPaused
                  ? 'Pause Reading'
                  : isPaused
                  ? 'Resume Reading'
                  : 'Start Reading Full Content'
              }
              title="Play / Pause (Spacebar)"
            >
              {isPlaying && !isPaused ? (
                <Pause size={28} aria-hidden="true" />
              ) : (
                <Play size={28} aria-hidden="true" style={{ marginLeft: '3px' }} />
              )}
            </button>

            {/* Stop Button */}
            <button
              type="button"
              className="playback-btn"
              onClick={stop}
              disabled={!isPlaying && !isPaused}
              aria-label="Stop Reading and Reset"
              title="Stop Reading (S)"
            >
              <Square size={18} aria-hidden="true" />
            </button>

            {/* Next Sentence */}
            <button
              type="button"
              className="playback-btn"
              onClick={nextSentence}
              disabled={currentSentenceIndex >= sentences.length - 1}
              aria-label="Next Sentence"
              title="Next Sentence (Right Arrow)"
            >
              <SkipForward size={20} aria-hidden="true" />
            </button>

            {/* Toggle Audio Settings Drawer */}
            <button
              type="button"
              className={`playback-btn ${expandedSettings ? 'active' : ''}`}
              onClick={() => setExpandedSettings(!expandedSettings)}
              aria-expanded={expandedSettings}
              aria-label="Toggle Voice, Speed, and Pitch Settings"
              title="Voice & Speed Settings"
            >
              <Sliders size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Expandable Audio Settings (Voice, Speed, Pitch, Volume) */}
        {expandedSettings && (
          <div
            className="dock-sliders-row"
            role="region"
            aria-label="Fine-tuning speech synthesis parameters"
          >
            {/* Speed Presets & Slider */}
            <div className="slider-item">
              <label htmlFor="pwa-speech-rate" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Gauge size={14} aria-hidden="true" />
                <span>Speed ({speechRate.toFixed(1)}x):</span>
              </label>
              <input
                id="pwa-speech-rate"
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="slider-input"
                aria-label={`Speech rate ${speechRate.toFixed(1)}x`}
              />
            </div>

            {/* Pitch Slider */}
            <div className="slider-item">
              <label htmlFor="pwa-speech-pitch">
                Pitch ({speechPitch.toFixed(1)}):
              </label>
              <input
                id="pwa-speech-pitch"
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechPitch}
                onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                className="slider-input"
                aria-label={`Speech pitch ${speechPitch.toFixed(1)}`}
              />
            </div>

            {/* Volume Slider */}
            <div className="slider-item">
              <label htmlFor="pwa-speech-volume" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Volume2 size={14} aria-hidden="true" />
                <span>Vol ({Math.round(speechVolume * 100)}%):</span>
              </label>
              <input
                id="pwa-speech-volume"
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={speechVolume}
                onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                className="slider-input"
                aria-label={`Speech volume ${Math.round(speechVolume * 100)} percent`}
              />
            </div>

            {/* English Voice Selector */}
            <div className="slider-item">
              <label htmlFor="pwa-english-voice">English Voice:</label>
              <select
                id="pwa-english-voice"
                className="accessible-select"
                value={englishVoiceName}
                onChange={(e) => {
                  setEnglishVoiceName(e.target.value);
                  announce(`English voice set to ${e.target.value || 'Auto Natural'}`);
                }}
              >
                <option value="">Auto (Warm & Natural)</option>
                {englishVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} {v.localService ? '' : '★'}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="action-btn"
                style={{ minHeight: '36px', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => handlePreviewVoice(false)}
                title="Preview English voice sample"
              >
                Preview EN
              </button>
            </div>

            {/* Urdu Voice Selector */}
            <div className="slider-item">
              <label htmlFor="pwa-urdu-voice">اردو آواز:</label>
              <select
                id="pwa-urdu-voice"
                className="accessible-select"
                value={urduVoiceName}
                onChange={(e) => {
                  setUrduVoiceName(e.target.value);
                  announce(`Urdu voice set to ${e.target.value}`);
                }}
              >
                {urduVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="action-btn urdu-mode-btn"
                style={{ minHeight: '36px', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => handlePreviewVoice(true)}
                title="Preview Urdu voice sample"
              >
                آواز سنیں
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
