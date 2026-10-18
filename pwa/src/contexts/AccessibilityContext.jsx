import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

const STORAGE_KEY = 'accessvision_pwa_settings';

export function AccessibilityProvider({ children }) {
  // Load saved settings or defaults
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).theme || 'default';
    } catch (e) {}
    return 'default';
  });

  const [fontScale, setFontScale] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).fontScale || 1.0;
    } catch (e) {}
    return 1.0;
  });

  const [readingMode, setReadingMode] = useState(false);
  
  const [dyslexicFont, setDyslexicFont] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return Boolean(JSON.parse(saved).dyslexicFont);
    } catch (e) {}
    return false;
  });

  const [speechRate, setSpeechRate] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).speechRate || 1.0;
    } catch (e) {}
    return 1.0;
  });

  const [speechPitch, setSpeechPitch] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).speechPitch || 1.0;
    } catch (e) {}
    return 1.0;
  });

  const [speechVolume, setSpeechVolume] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).speechVolume || 1.0;
    } catch (e) {}
    return 1.0;
  });

  const [englishVoiceName, setEnglishVoiceName] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).englishVoiceName || '';
    } catch (e) {}
    return '';
  });

  const [urduVoiceName, setUrduVoiceName] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).urduVoiceName || 'online-natural-urdu';
    } catch (e) {}
    return 'online-natural-urdu';
  });

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [announcement, setAnnouncement] = useState('');

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      announce('Internet connection restored. Online features available.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      announce('Internet connection lost. Switched to offline mode with cached articles.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync DOM with state
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.body.style.setProperty('--av-font-scale', fontScale);
    if (dyslexicFont) {
      document.body.classList.add('font-dyslexic');
    } else {
      document.body.classList.remove('font-dyslexic');
    }

    if (readingMode) {
      document.body.classList.add('reading-mode-active');
    } else {
      document.body.classList.remove('reading-mode-active');
    }

    // Persist preferences
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          theme,
          fontScale,
          dyslexicFont,
          speechRate,
          speechPitch,
          speechVolume,
          englishVoiceName,
          urduVoiceName
        })
      );
    } catch (e) {}
  }, [theme, fontScale, dyslexicFont, readingMode, speechRate, speechPitch, speechVolume, englishVoiceName, urduVoiceName]);

  // Screen reader announcer helper
  const announce = (message) => {
    setAnnouncement('');
    setTimeout(() => {
      setAnnouncement(message);
    }, 50);
  };

  // Cycle high-contrast themes
  const cycleTheme = () => {
    const themes = ['default', 'yellow-black', 'cyan-black', 'white-black', 'soft-cream'];
    const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    setTheme(nextTheme);

    const names = {
      default: 'Obsidian Slate default',
      'yellow-black': 'High contrast Yellow on Black',
      'cyan-black': 'High contrast Cyan on Black',
      'white-black': 'High contrast Monochrome White on Black',
      'soft-cream': 'Soft Sepia Cream'
    };
    announce(`Theme changed to ${names[nextTheme]}`);
  };

  const toggleReadingMode = () => {
    setReadingMode((prev) => {
      const next = !prev;
      announce(next ? 'Reading mode activated. Showing clean content view.' : 'Reading mode deactivated.');
      return next;
    });
  };

  const toggleDyslexicFont = () => {
    setDyslexicFont((prev) => {
      const next = !prev;
      announce(next ? 'Dyslexia-friendly font enabled.' : 'Standard font enabled.');
      return next;
    });
  };

  const increaseFont = () => {
    setFontScale((prev) => {
      const next = Math.min(1.8, +(prev + 0.15).toFixed(2));
      announce(`Font size increased to ${Math.round(next * 100)} percent.`);
      return next;
    });
  };

  const decreaseFont = () => {
    setFontScale((prev) => {
      const next = Math.max(0.85, +(prev - 0.15).toFixed(2));
      announce(`Font size decreased to ${Math.round(next * 100)} percent.`);
      return next;
    });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        setTheme,
        cycleTheme,
        fontScale,
        setFontScale,
        increaseFont,
        decreaseFont,
        readingMode,
        setReadingMode,
        toggleReadingMode,
        dyslexicFont,
        toggleDyslexicFont,
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
        isOnline,
        announcement,
        announce
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return ctx;
}
