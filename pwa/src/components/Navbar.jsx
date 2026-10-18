import React from 'react';
import {
  Eye,
  Mic,
  Moon,
  Sun,
  BookOpen,
  Keyboard,
  Download,
  Wifi,
  WifiOff,
  Sparkles
} from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function Navbar({
  onOpenLibrary,
  onOpenShortcuts,
  onOpenVoiceCommands,
  isListeningVoice,
  deferredInstallPrompt,
  onTriggerInstall
}) {
  const { theme, cycleTheme, isOnline } = useAccessibility();

  return (
    <header className="app-header" role="banner">
      <div className="header-inner">
        {/* Brand Group */}
        <div className="brand-wrapper" tabIndex={0} aria-label="AccessVision Progressive Web App Home">
          <img
            src="/icons/icon-192.png"
            alt="AccessVision Logo"
            className="brand-logo"
            width="40"
            height="40"
          />
          <div className="brand-text-group">
            <div className="brand-title">
              AccessVision
              <span className="brand-badge">PWA</span>
            </div>
            <span className="brand-subtitle">
              Accessible Reader & Voice Assistant
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions" role="toolbar" aria-label="Header quick tools">
          {/* Online / Offline status */}
          <div
            className={`status-pill ${!isOnline ? 'offline' : ''}`}
            role="status"
            aria-label={isOnline ? 'Internet Online' : 'Offline Mode (Using Cached Content)'}
            title={isOnline ? 'Online' : 'Offline - Cached Content Available'}
          >
            <span className="status-dot" aria-hidden="true"></span>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Voice Command Mic Trigger */}
          <button
            type="button"
            className={`icon-btn ${isListeningVoice ? 'active mic-pulsing' : ''}`}
            onClick={onOpenVoiceCommands}
            aria-label={isListeningVoice ? 'Voice commands active. Click to view status or stop' : 'Activate Voice Commands'}
            title="Voice Commands (Hands-Free Control)"
          >
            <Mic size={20} aria-hidden="true" color={isListeningVoice ? '#ef4444' : 'currentColor'} />
            <span className="sr-only">Voice Commands</span>
          </button>

          {/* Library Button */}
          <button
            type="button"
            className="action-btn"
            onClick={onOpenLibrary}
            aria-label="Open Library and Content Switcher"
            title="Browse Articles or Paste Text"
          >
            <BookOpen size={18} aria-hidden="true" />
            <span>Library</span>
          </button>

          {/* High Contrast Cycle */}
          <button
            type="button"
            className="icon-btn"
            onClick={cycleTheme}
            aria-label={`Cycle High Contrast Theme. Current: ${theme}`}
            title="Cycle High Contrast Themes"
          >
            <Sun size={20} aria-hidden="true" />
            <span className="sr-only">Toggle Contrast</span>
          </button>

          {/* Keyboard Shortcuts */}
          <button
            type="button"
            className="icon-btn"
            onClick={onOpenShortcuts}
            aria-label="View Keyboard Shortcuts Cheat Sheet"
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard size={20} aria-hidden="true" />
            <span className="sr-only">Shortcuts</span>
          </button>

          {/* Add to Home Screen / Install Button */}
          {deferredInstallPrompt && (
            <button
              type="button"
              className="action-btn primary"
              onClick={onTriggerInstall}
              aria-label="Install AccessVision as Standalone App on your Device"
              title="Install App"
            >
              <Download size={18} aria-hidden="true" />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
