import React from 'react';
import {
  Type,
  Sun,
  Eye,
  Sliders,
  Sparkles,
  BookOpen,
  Volume2
} from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { usePlayback } from '../contexts/PlaybackContext';

export default function AccessibilityToolbar() {
  const {
    theme,
    cycleTheme,
    fontScale,
    increaseFont,
    decreaseFont,
    readingMode,
    toggleReadingMode,
    dyslexicFont,
    toggleDyslexicFont
  } = useAccessibility();

  const { languageMode, toggleLanguageMode } = usePlayback();

  const themeDisplayNames = {
    default: 'Obsidian Slate (Default)',
    'yellow-black': 'Yellow on Black (AAA)',
    'cyan-black': 'Cyan on Black (AAA)',
    'white-black': 'Monochrome White (AAA)',
    'soft-cream': 'Soft Sepia Light'
  };

  return (
    <nav
      className="accessibility-toolbar"
      aria-label="Accessibility and display settings toolbar"
      role="region"
    >
      {/* Contrast Group */}
      <div className="toolbar-group">
        <span className="toolbar-label">
          <Sun size={15} aria-hidden="true" />
          <span>Contrast:</span>
        </span>
        <button
          type="button"
          className="action-btn"
          onClick={cycleTheme}
          aria-label={`Cycle Contrast Theme. Currently ${themeDisplayNames[theme]}`}
          title="Switch High Contrast Mode"
        >
          {themeDisplayNames[theme]}
        </button>
      </div>

      {/* Font Size Group */}
      <div className="toolbar-group">
        <span className="toolbar-label">
          <Type size={15} aria-hidden="true" />
          <span>Font Size:</span>
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={decreaseFont}
          disabled={fontScale <= 0.85}
          aria-label="Decrease font size"
          title="Decrease Font Size"
        >
          <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>A-</span>
        </button>
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.9rem',
            padding: '0 4px',
            minWidth: '46px',
            textAlign: 'center'
          }}
          aria-label={`Current font scaling ${Math.round(fontScale * 100)} percent`}
        >
          {Math.round(fontScale * 100)}%
        </span>
        <button
          type="button"
          className="icon-btn"
          onClick={increaseFont}
          disabled={fontScale >= 1.8}
          aria-label="Increase font size"
          title="Increase Font Size"
        >
          <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>A+</span>
        </button>
      </div>

      {/* Dyslexia Friendly Font Toggle */}
      <div className="toolbar-group">
        <button
          type="button"
          className={`action-btn ${dyslexicFont ? 'active' : ''}`}
          onClick={toggleDyslexicFont}
          aria-pressed={dyslexicFont}
          title="Toggle Dyslexia-Friendly High Legibility Font"
        >
          <Type size={16} aria-hidden="true" />
          <span>Dyslexia Font</span>
        </button>
      </div>

      {/* Distraction-Free Reading Mode Toggle */}
      <div className="toolbar-group">
        <button
          type="button"
          className={`action-btn ${readingMode ? 'active' : ''}`}
          onClick={toggleReadingMode}
          aria-pressed={readingMode}
          title="Toggle Distraction-Free Zen Reading Mode"
        >
          <BookOpen size={16} aria-hidden="true" />
          <span>Reading Mode</span>
        </button>
      </div>

      {/* Urdu Language Switcher */}
      <div className="toolbar-group">
        <button
          type="button"
          className={`action-btn urdu-mode-btn ${languageMode === 'ur' ? 'active' : ''}`}
          onClick={toggleLanguageMode}
          aria-label={`Current voice language: ${
            languageMode === 'ur'
              ? 'Urdu'
              : languageMode === 'en'
              ? 'English'
              : 'Auto Language Detection'
          }. Click to switch.`}
          title="Toggle Urdu / English / Auto Voice Language"
        >
          <span aria-hidden="true">🇵🇰</span>
          <span>{languageMode === 'ur' ? 'اردو فعال ہے' : 'اردو میں سنیں'}</span>
        </button>
      </div>
    </nav>
  );
}
