import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import speechService from '../services/speechService';
import { splitIntoSentences, detectLanguage } from '../services/urduDetector';
import { SAMPLE_ARTICLES, getArticleById } from '../services/sampleLibrary';
import { useAccessibility } from './AccessibilityContext';

const PlaybackContext = createContext(null);

export function PlaybackProvider({ children }) {
  const {
    speechRate,
    speechPitch,
    speechVolume,
    englishVoiceName,
    urduVoiceName,
    announce
  } = useAccessibility();

  const [currentArticle, setCurrentArticle] = useState(() => SAMPLE_ARTICLES[0]);
  const [sentences, setSentences] = useState(() => splitIntoSentences(SAMPLE_ARTICLES[0].content));
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [languageMode, setLanguageMode] = useState('auto'); // 'auto' | 'ur' | 'en'

  // Ref to always have latest state in async speech callbacks
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentIndexRef = useRef(0);
  const sentencesRef = useRef(sentences);

  isPlayingRef.current = isPlaying;
  isPausedRef.current = isPaused;
  currentIndexRef.current = currentSentenceIndex;
  sentencesRef.current = sentences;

  // Whenever currentArticle changes, re-segment sentences
  useEffect(() => {
    const segmented = splitIntoSentences(currentArticle.content);
    setSentences(segmented);
    sentencesRef.current = segmented;
    setCurrentSentenceIndex(0);
    currentIndexRef.current = 0;
  }, [currentArticle]);

  /**
   * Reads a single sentence by index, then automatically moves to next sentence.
   */
  const speakSentenceAt = (index) => {
    const list = sentencesRef.current;
    if (index < 0 || index >= list.length) {
      stop();
      announce('Reading completed.');
      return;
    }

    setCurrentSentenceIndex(index);
    currentIndexRef.current = index;

    // Auto scroll active sentence into view
    setTimeout(() => {
      const el = document.getElementById(`sentence-${index}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    const s = list[index];
    let targetLang = s.lang;
    if (languageMode === 'ur') targetLang = 'ur';
    if (languageMode === 'en') targetLang = 'en';

    const selectedVoice = targetLang === 'ur' ? urduVoiceName : englishVoiceName;

    speechService.speak(
      s.text,
      {
        lang: targetLang,
        rate: speechRate,
        pitch: speechPitch,
        volume: speechVolume,
        voiceName: selectedVoice
      },
      () => {
        // onEnd callback: if still playing and not paused, advance to next sentence
        if (isPlayingRef.current && !isPausedRef.current) {
          const nextIdx = currentIndexRef.current + 1;
          if (nextIdx < sentencesRef.current.length) {
            speakSentenceAt(nextIdx);
          } else {
            stop();
            announce('Finished reading the article.');
          }
        }
      }
    );
  };

  /**
   * Starts playback from given index (defaults to current or 0).
   */
  const play = (startIndex = null) => {
    const idx = startIndex !== null ? startIndex : currentSentenceIndex;
    setIsPlaying(true);
    setIsPaused(false);
    announce(`Reading started at sentence ${idx + 1}.`);
    speakSentenceAt(idx);
  };

  /**
   * Pauses active speech playback.
   */
  const pause = () => {
    speechService.pause();
    setIsPaused(true);
    announce('Playback paused.');
  };

  /**
   * Resumes paused playback.
   */
  const resume = () => {
    setIsPaused(false);
    setIsPlaying(true);
    announce('Playback resumed.');
    // If Web Speech API paused state fails to resume cleanly, re-trigger current sentence
    speechService.resume();
    if (!speechService.isSpeaking) {
      speakSentenceAt(currentSentenceIndex);
    }
  };

  /**
   * Stops playback completely and resets.
   */
  const stop = () => {
    speechService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    announce('Playback stopped.');
  };

  /**
   * Jump to next sentence.
   */
  const nextSentence = () => {
    const nextIdx = Math.min(sentences.length - 1, currentSentenceIndex + 1);
    setCurrentSentenceIndex(nextIdx);
    announce(`Next sentence, ${nextIdx + 1} of ${sentences.length}`);
    if (isPlaying) {
      speakSentenceAt(nextIdx);
    }
  };

  /**
   * Jump to previous sentence.
   */
  const prevSentence = () => {
    const prevIdx = Math.max(0, currentSentenceIndex - 1);
    setCurrentSentenceIndex(prevIdx);
    announce(`Previous sentence, ${prevIdx + 1} of ${sentences.length}`);
    if (isPlaying) {
      speakSentenceAt(prevIdx);
    }
  };

  /**
   * Jump directly to a sentence index and speak it.
   */
  const jumpToSentence = (index) => {
    setCurrentSentenceIndex(index);
    setIsPlaying(true);
    setIsPaused(false);
    speakSentenceAt(index);
  };

  /**
   * Loads an article and optionally begins reading.
   */
  const loadArticle = (article, autoPlay = false) => {
    stop();
    setCurrentArticle(article);
    const lang = article.lang || detectLanguage(article.content);
    setLanguageMode(lang);
    announce(`Loaded article: ${article.title}. Language: ${lang === 'ur' ? 'Urdu' : 'English'}`);
    if (autoPlay) {
      setTimeout(() => play(0), 100);
    }
  };

  /**
   * Switches language mode (Urdu vs English vs Auto).
   */
  const toggleLanguageMode = () => {
    const modes = ['auto', 'ur', 'en'];
    const next = modes[(modes.indexOf(languageMode) + 1) % modes.length];
    setLanguageMode(next);
    const labels = {
      auto: 'Automatic Language Detection',
      ur: 'Urdu Language Mode (اردو آواز)',
      en: 'English Language Mode'
    };
    announce(`Language set to ${labels[next]}`);
  };

  return (
    <PlaybackContext.Provider
      value={{
        currentArticle,
        sentences,
        currentSentenceIndex,
        isPlaying,
        isPaused,
        languageMode,
        setLanguageMode,
        toggleLanguageMode,
        loadArticle,
        play,
        pause,
        resume,
        stop,
        nextSentence,
        prevSentence,
        jumpToSentence
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return ctx;
}
