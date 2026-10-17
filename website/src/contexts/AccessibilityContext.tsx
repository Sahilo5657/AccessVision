/**
 * AccessibilityContext – Global Accessibility State Management
 *
 * Provides centralized state for all accessibility features:
 * - High contrast mode toggle
 * - Font size scaling
 * - Reading mode toggle
 * - Screen reader announcement helper
 *
 * All preferences are persisted to localStorage so users
 * retain their settings across sessions (privacy-first, no server storage).
 *
 * @module AccessibilityContext
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

/** Available font size scale options */
type FontScale = 'sm' | 'base' | 'lg' | 'xl' | 'xxl';

/** Shape of the accessibility context value */
interface AccessibilityContextType {
  /** Whether high-contrast mode is enabled */
  highContrast: boolean;
  /** Toggle high-contrast mode on/off */
  toggleHighContrast: () => void;
  /** Current font size scale */
  fontScale: FontScale;
  /** Set the font size scale */
  setFontScale: (scale: FontScale) => void;
  /** Increase the font size by one step */
  increaseFontSize: () => void;
  /** Decrease the font size by one step */
  decreaseFontSize: () => void;
  /** Whether reading mode is enabled */
  readingMode: boolean;
  /** Toggle reading mode on/off */
  toggleReadingMode: () => void;
  /** Announce a message to screen readers via ARIA live region */
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

/** Ordered list of font scales for increment/decrement */
const FONT_SCALES: FontScale[] = ['sm', 'base', 'lg', 'xl', 'xxl'];

/** Human-readable labels for font scales (used in announcements) */
const FONT_SCALE_LABELS: Record<FontScale, string> = {
  sm: 'Small',
  base: 'Medium (default)',
  lg: 'Large',
  xl: 'Extra Large',
  xxl: 'Maximum',
};

/** LocalStorage keys */
const LS_HIGH_CONTRAST = 'av-high-contrast';
const LS_FONT_SCALE = 'av-font-scale';
const LS_READING_MODE = 'av-reading-mode';

/**
 * Reads a boolean from localStorage.
 */
function readBool(key: string, fallback: boolean): boolean {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    return val === 'true';
  } catch {
    return fallback;
  }
}

/**
 * Reads a font scale from localStorage.
 */
function readFontScale(key: string, fallback: FontScale): FontScale {
  try {
    const val = localStorage.getItem(key) as FontScale | null;
    if (val && FONT_SCALES.includes(val)) return val;
    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * AccessibilityProvider – wraps the application and provides
 * accessibility preferences and utilities to all child components.
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(() =>
    readBool(LS_HIGH_CONTRAST, false)
  );
  const [fontScale, setFontScaleState] = useState<FontScale>(() =>
    readFontScale(LS_FONT_SCALE, 'base')
  );
  const [readingMode, setReadingMode] = useState(() =>
    readBool(LS_READING_MODE, false)
  );
  const [announcement, setAnnouncement] = useState('');
  const [announcementPriority, setAnnouncementPriority] = useState<
    'polite' | 'assertive'
  >('polite');

  // --- Persist preferences ---
  useEffect(() => {
    localStorage.setItem(LS_HIGH_CONTRAST, String(highContrast));
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem(LS_FONT_SCALE, fontScale);
    // Remove all scale classes then add current
    FONT_SCALES.forEach((s) =>
      document.documentElement.classList.remove(`font-scale-${s}`)
    );
    document.documentElement.classList.add(`font-scale-${fontScale}`);
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem(LS_READING_MODE, String(readingMode));
    document.documentElement.classList.toggle('reading-mode', readingMode);
  }, [readingMode]);

  // --- Actions ---
  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      // Clear announcement first to allow re-announcement of same text
      setAnnouncement('');
      setTimeout(
        () =>
          setAnnouncement(
            next ? 'High contrast mode enabled' : 'High contrast mode disabled'
          ),
        50
      );
      return next;
    });
  }, []);

  const setFontScale = useCallback(
    (scale: FontScale) => {
      setFontScaleState(scale);
      setAnnouncement('');
      setTimeout(
        () => setAnnouncement(`Font size set to ${FONT_SCALE_LABELS[scale]}`),
        50
      );
    },
    []
  );

  const increaseFontSize = useCallback(() => {
    setFontScaleState((prev) => {
      const idx = FONT_SCALES.indexOf(prev);
      if (idx < FONT_SCALES.length - 1) {
        const next = FONT_SCALES[idx + 1];
        setAnnouncement('');
        setTimeout(
          () =>
            setAnnouncement(`Font size increased to ${FONT_SCALE_LABELS[next]}`),
          50
        );
        return next;
      }
      setAnnouncement('');
      setTimeout(() => setAnnouncement('Font size is already at maximum'), 50);
      return prev;
    });
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontScaleState((prev) => {
      const idx = FONT_SCALES.indexOf(prev);
      if (idx > 0) {
        const next = FONT_SCALES[idx - 1];
        setAnnouncement('');
        setTimeout(
          () =>
            setAnnouncement(`Font size decreased to ${FONT_SCALE_LABELS[next]}`),
          50
        );
        return next;
      }
      setAnnouncement('');
      setTimeout(() => setAnnouncement('Font size is already at minimum'), 50);
      return prev;
    });
  }, []);

  const toggleReadingMode = useCallback(() => {
    setReadingMode((prev) => {
      const next = !prev;
      setAnnouncement('');
      setTimeout(
        () =>
          setAnnouncement(
            next ? 'Reading mode enabled' : 'Reading mode disabled'
          ),
        50
      );
      return next;
    });
  }, []);

  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      setAnnouncementPriority(priority);
      setAnnouncement('');
      setTimeout(() => setAnnouncement(message), 50);
    },
    []
  );

  const contextValue: AccessibilityContextType = {
    highContrast,
    toggleHighContrast,
    fontScale,
    setFontScale,
    increaseFontSize,
    decreaseFontSize,
    readingMode,
    toggleReadingMode,
    announce,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}

      {/* ARIA Live Region – announces state changes to screen readers */}
      <div
        aria-live={announcementPriority}
        aria-atomic="true"
        role="status"
        className="sr-only"
      >
        {announcement}
      </div>
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access the accessibility context.
 * Must be used within an AccessibilityProvider.
 *
 * @returns AccessibilityContextType
 * @throws Error if used outside of AccessibilityProvider
 *
 * @example
 * ```tsx
 * const { highContrast, toggleHighContrast } = useAccessibility();
 * ```
 */
export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
}
