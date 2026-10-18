import React from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function ScreenReaderAnnouncer() {
  const { announcement } = useAccessibility();

  return (
    <div
      id="av-live-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
