/**
 * AccessibilityToolbar – Floating Accessibility Controls Panel
 *
 * Provides a persistent, accessible toolbar with controls for:
 * - High contrast mode
 * - Font size adjustment
 * - Reading mode
 *
 * The toolbar can be toggled open/closed and respects keyboard navigation.
 * It uses aria-expanded, aria-controls, and role="toolbar" for
 * screen reader compatibility.
 *
 * @module AccessibilityToolbar
 */
import React, { useState, useRef, useEffect } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const AccessibilityToolbar: React.FC = () => {
  const {
    highContrast,
    toggleHighContrast,
    fontScale,
    increaseFontSize,
    decreaseFontSize,
    readingMode,
    toggleReadingMode,
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        toggleButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const fontScaleLabel: Record<string, string> = {
    sm: 'Small',
    base: 'Medium',
    lg: 'Large',
    xl: 'Extra Large',
    xxl: 'Maximum',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9998] no-print">
      {/* Toggle Button */}
      <button
        ref={toggleButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="a11y-toolbar-panel"
        aria-label={
          isOpen
            ? 'Close accessibility toolbar'
            : 'Open accessibility toolbar'
        }
        className="w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 focus-visible:ring-4 focus-visible:ring-primary-400 transition-all flex items-center justify-center"
      >
        <svg
          aria-hidden="true"
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      </button>

      {/* Toolbar Panel */}
      {isOpen && (
        <div
          id="a11y-toolbar-panel"
          ref={panelRef}
          role="toolbar"
          aria-label="Accessibility settings"
          className="absolute bottom-16 right-0 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Accessibility Settings
          </h2>

          {/* High Contrast Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="hc-toggle"
              className="text-sm font-medium text-gray-700"
            >
              High Contrast
            </label>
            <button
              id="hc-toggle"
              role="switch"
              aria-checked={highContrast}
              onClick={toggleHighContrast}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highContrast ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span className="sr-only">
                {highContrast ? 'Disable' : 'Enable'} high contrast mode
              </span>
              <span
                aria-hidden="true"
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Font Size Controls */}
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">
              Font Size: {fontScaleLabel[fontScale]}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={decreaseFontSize}
                aria-label="Decrease font size"
                className="flex-1 py-2 px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700 min-h-[2.75rem]"
              >
                A<span aria-hidden="true">-</span>
              </button>
              <span
                aria-live="polite"
                aria-atomic="true"
                className="flex-1 py-2 px-3 bg-primary-50 rounded-lg text-center text-sm font-medium text-primary-700 min-h-[2.75rem] flex items-center justify-center"
              >
                {fontScaleLabel[fontScale]}
              </span>
              <button
                onClick={increaseFontSize}
                aria-label="Increase font size"
                className="flex-1 py-2 px-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700 min-h-[2.75rem]"
              >
                A<span aria-hidden="true">+</span>
              </button>
            </div>
          </div>

          {/* Reading Mode Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="reading-toggle"
              className="text-sm font-medium text-gray-700"
            >
              Reading Mode
            </label>
            <button
              id="reading-toggle"
              role="switch"
              aria-checked={readingMode}
              onClick={toggleReadingMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                readingMode ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            >
              <span className="sr-only">
                {readingMode ? 'Disable' : 'Enable'} reading mode
              </span>
              <span
                aria-hidden="true"
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  readingMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Keyboard Shortcut Hint */}
          <p className="text-xs text-gray-500 border-t pt-3">
            Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs font-mono">Esc</kbd> to close this panel.
          </p>
        </div>
      )}
    </div>
  );
};
