/**
 * SkipLink – Accessible Skip Navigation Link
 *
 * Provides a hidden link that becomes visible when focused via keyboard.
 * Allows screen reader and keyboard users to skip repetitive navigation
 * and jump directly to the main content.
 *
 * WCAG 2.4.1 (Bypass Blocks) – Level A
 *
 * @module SkipLink
 */
import React from 'react';

interface SkipLinkProps {
  /** The ID of the target element (without #) */
  targetId?: string;
  /** Custom label for the skip link */
  label?: string;
}

/**
 * Renders a skip-to-main-content link.
 *
 * @example
 * ```tsx
 * <SkipLink targetId="main-content" />
 * ```
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  targetId = 'main-content',
  label = 'Skip to main content',
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
      // Remove tabindex after blur so it doesn't interfere with tab order
      target.addEventListener(
        'blur',
        () => target.removeAttribute('tabindex'),
        { once: true }
      );
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      onClick={handleClick}
    >
      {label}
    </a>
  );
};
