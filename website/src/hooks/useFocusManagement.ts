/**
 * useFocusManagement – Hook for managing focus in accessible ways
 *
 * Provides utilities for:
 * - Moving focus to a specific element
 * - Trapping focus within a modal/dialog
 * - Returning focus after a dialog closes
 *
 * @module useFocusManagement
 */
import { useRef, useEffect, useCallback } from 'react';

/**
 * Returns a ref and a function to programmatically focus it.
 * Useful for moving focus to headings after route changes,
 * or to error summaries after form validation.
 *
 * @example
 * ```tsx
 * const { targetRef, focusTarget } = useFocusTarget<HTMLHeadingElement>();
 * // After navigation:
 * useEffect(() => { focusTarget(); }, [location]);
 * return <h1 ref={targetRef} tabIndex={-1}>Page Title</h1>;
 * ```
 */
export function useFocusTarget<T extends HTMLElement>() {
  const targetRef = useRef<T>(null);

  const focusTarget = useCallback(() => {
    if (targetRef.current) {
      targetRef.current.focus();
    }
  }, []);

  return { targetRef, focusTarget };
}

/**
 * Traps focus within a container element (for modals/dialogs).
 * Returns a ref to attach to the container.
 *
 * @param active - Whether the focus trap is active
 *
 * @example
 * ```tsx
 * const trapRef = useFocusTrap<HTMLDivElement>(isModalOpen);
 * return <div ref={trapRef} role="dialog" aria-modal="true">...</div>;
 * ```
 */
export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelectors =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const focusable = container.querySelectorAll<HTMLElement>(focusableSelectors);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown);

    // Focus the first focusable element
    const firstFocusable = container.querySelector<HTMLElement>(focusableSelectors);
    if (firstFocusable) firstFocusable.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return containerRef;
}
