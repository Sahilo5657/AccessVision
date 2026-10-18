import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import ReaderView from './components/ReaderView';
import PlaybackController from './components/PlaybackController';
import LibraryDrawer from './components/LibraryDrawer';
import VoiceCommandsModal from './components/VoiceCommandsModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import InstallPrompt from './components/InstallPrompt';
import ScreenReaderAnnouncer from './components/ScreenReaderAnnouncer';
import { useAccessibility } from './contexts/AccessibilityContext';
import { usePlayback } from './contexts/PlaybackContext';
import voiceCommandService from './services/voiceCommandService';

export default function App() {
  const {
    theme,
    cycleTheme,
    increaseFont,
    decreaseFont,
    toggleReadingMode,
    readingMode,
    speechRate,
    setSpeechRate,
    announce
  } = useAccessibility();

  const {
    isPlaying,
    isPaused,
    play,
    pause,
    resume,
    stop,
    nextSentence,
    prevSentence,
    setLanguageMode
  } = usePlayback();

  // Modals state
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  // Voice Command state
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [lastVoiceCommand, setLastVoiceCommand] = useState('');

  // PWA Install state
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);

  // Listen for beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
      console.log('[AccessVision PWA] beforeinstallprompt captured.');
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      announce('AccessVision app installed successfully on your device!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [announce]);

  // Voice Command Action Handler
  const handleVoiceCommand = useCallback((action, detail, rawText) => {
    setLastVoiceCommand(rawText);

    switch (action) {
      case 'play':
        play();
        break;
      case 'pause':
        pause();
        break;
      case 'resume':
        resume();
        break;
      case 'stop':
        stop();
        break;
      case 'next':
        nextSentence();
        break;
      case 'previous':
        prevSentence();
        break;
      case 'set-language':
        setLanguageMode(detail);
        announce(detail === 'ur' ? 'Switched to Urdu Voice mode' : 'Switched to English Voice mode');
        break;
      case 'toggle-contrast':
        cycleTheme();
        break;
      case 'toggle-reading-mode':
        toggleReadingMode();
        break;
      case 'speed-up':
        setSpeechRate((r) => +(Math.min(2.0, r + 0.2)).toFixed(1));
        announce('Speech speed increased');
        break;
      case 'speed-down':
        setSpeechRate((r) => +(Math.max(0.5, r - 0.2)).toFixed(1));
        announce('Speech speed decreased');
        break;
      case 'font-up':
        increaseFont();
        break;
      case 'font-down':
        decreaseFont();
        break;
      case 'help':
        setVoiceModalOpen(true);
        break;
      default:
        break;
    }
  }, [play, pause, resume, stop, nextSentence, prevSentence, setLanguageMode, cycleTheme, toggleReadingMode, setSpeechRate, increaseFont, decreaseFont, announce]);

  const toggleVoiceListening = () => {
    if (isListeningVoice) {
      voiceCommandService.stop();
      setIsListeningVoice(false);
      announce('Voice listening stopped.');
    } else {
      const started = voiceCommandService.start(
        handleVoiceCommand,
        (transcript) => setVoiceTranscript(transcript),
        (status) => setIsListeningVoice(status)
      );
      if (started) {
        setIsListeningVoice(true);
        announce('Voice recognition started. Say a command like read or urdu.');
      }
    }
  };

  // Keyboard navigation handler
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't intercept if user is typing in input or textarea
      const tag = e.target.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying && !isPaused) {
            pause();
          } else if (isPlaying && isPaused) {
            resume();
          } else {
            play();
          }
          break;

        case 's':
        case 'S':
          e.preventDefault();
          stop();
          break;

        case 'r':
        case 'R':
          e.preventDefault();
          if (isPaused) resume();
          else play();
          break;

        case 'ArrowRight':
          e.preventDefault();
          nextSentence();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          prevSentence();
          break;

        case 'c':
        case 'C':
        case 'h':
        case 'H':
          e.preventDefault();
          cycleTheme();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          toggleReadingMode();
          break;

        case 'u':
        case 'U':
          e.preventDefault();
          setLanguageMode('ur');
          announce('Switched to Urdu Language Mode (اردو آواز)');
          break;

        case 'e':
        case 'E':
          e.preventDefault();
          setLanguageMode('en');
          announce('Switched to English Language Mode');
          break;

        case '+':
        case '=':
          e.preventDefault();
          increaseFont();
          break;

        case '-':
        case '_':
          e.preventDefault();
          decreaseFont();
          break;

        case '?':
          e.preventDefault();
          setShortcutsOpen((prev) => !prev);
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isPlaying, isPaused, play, pause, resume, stop, nextSentence, prevSentence, cycleTheme, toggleReadingMode, setLanguageMode, increaseFont, decreaseFont, announce]);

  return (
    <div className="app-container">
      {/* Invisible Screen Reader Announcer for TalkBack and VoiceOver */}
      <ScreenReaderAnnouncer />

      {/* Main Accessible Header */}
      <Navbar
        onOpenLibrary={() => setLibraryOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        onOpenVoiceCommands={() => {
          setVoiceModalOpen(true);
          if (!isListeningVoice) toggleVoiceListening();
        }}
        isListeningVoice={isListeningVoice}
        deferredInstallPrompt={deferredInstallPrompt}
        onTriggerInstall={() => {
          if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
          }
        }}
      />

      {/* Main Container */}
      <main className="main-content">
        {/* Install to Home Screen Banner */}
        <InstallPrompt
          deferredPrompt={deferredInstallPrompt}
          onInstallSuccess={() => setDeferredInstallPrompt(null)}
        />

        {/* Accessibility Display Controls Toolbar */}
        <AccessibilityToolbar />

        {/* Reader Canvas with Full Content & Live Sentence Highlighting */}
        <ReaderView />
      </main>

      {/* Tactile Bottom Playback Controller Dock */}
      <PlaybackController />

      {/* Modals & Drawers */}
      <LibraryDrawer
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
      />

      <VoiceCommandsModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        isListening={isListeningVoice}
        onToggleListening={toggleVoiceListening}
        transcript={voiceTranscript}
        lastCommand={lastVoiceCommand}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
