/**
 * useAnnounce – Hook for screen reader announcements
 *
 * Provides a convenient way to make ARIA live region announcements
 * from any component without directly accessing the context.
 *
 * @module useAnnounce
 */
import { useAccessibility } from '../contexts/AccessibilityContext';

/**
 * Returns an announce function that sends messages to the ARIA live region.
 *
 * @example
 * ```tsx
 * const announce = useAnnounce();
 * announce('Form submitted successfully');
 * announce('Error: email is required', 'assertive');
 * ```
 */
export function useAnnounce() {
  const { announce } = useAccessibility();
  return announce;
}
