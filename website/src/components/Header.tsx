/**
 * Header – Accessible Site Header with Navigation
 *
 * Implements:
 * - Landmark: <header> with role="banner"
 * - Navigation: <nav> with aria-label
 * - Mobile menu: Accessible hamburger with aria-expanded
 * - Active link indication: aria-current="page"
 * - Keyboard navigation: Full tab support
 *
 * @module Header
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';

/** Navigation links definition */
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/articles', label: 'Articles' },
  { to: '/contact', label: 'Contact' },
  { to: '/about', label: 'About' },
] as const;

export const Header: React.FC = () => {
  const location = useLocation();
  const { highContrast, toggleHighContrast, increaseFontSize, decreaseFontSize } =
    useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      role="banner"
      className="bg-primary-800 text-white shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Site Title */}
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold hover:text-primary-200 transition-colors"
            aria-label="AccessVision Hub – Home"
          >
            {/* Accessible SVG icon */}
            <svg
              aria-hidden="true"
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>AccessVision</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-1"
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? 'page' : undefined}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[2.75rem] flex items-center ${
                  isActive(to)
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}

            {/* Accessibility Controls */}
            <div
              className="flex items-center gap-1 ml-4 pl-4 border-l border-primary-600"
              role="toolbar"
              aria-label="Accessibility controls"
            >
              <button
                onClick={decreaseFontSize}
                aria-label="Decrease font size"
                title="Decrease font size"
                className="p-2 rounded-lg hover:bg-primary-700 transition-colors min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center"
              >
                <span aria-hidden="true" className="text-sm font-bold">A-</span>
              </button>
              <button
                onClick={increaseFontSize}
                aria-label="Increase font size"
                title="Increase font size"
                className="p-2 rounded-lg hover:bg-primary-700 transition-colors min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center"
              >
                <span aria-hidden="true" className="text-lg font-bold">A+</span>
              </button>
              <button
                onClick={toggleHighContrast}
                aria-label={
                  highContrast
                    ? 'Disable high contrast mode'
                    : 'Enable high contrast mode'
                }
                aria-pressed={highContrast}
                title={
                  highContrast ? 'Disable high contrast' : 'Enable high contrast'
                }
                className={`p-2 rounded-lg transition-colors min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center ${
                  highContrast
                    ? 'bg-yellow-400 text-black'
                    : 'hover:bg-primary-700'
                }`}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 2v16a8 8 0 000-16z" />
                </svg>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg hover:bg-primary-700 transition-colors min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center"
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav
            id="mobile-menu"
            ref={mobileNavRef}
            aria-label="Mobile navigation"
            className="md:hidden pb-4 border-t border-primary-600 mt-2 pt-4"
          >
            <ul className="flex flex-col gap-2" role="list">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    aria-current={isActive(to) ? 'page' : undefined}
                    className={`block px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive(to)
                        ? 'bg-primary-600 text-white'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile Accessibility Controls */}
            <div
              className="flex items-center gap-2 mt-4 pt-4 border-t border-primary-600"
              role="toolbar"
              aria-label="Accessibility controls"
            >
              <button
                onClick={decreaseFontSize}
                aria-label="Decrease font size"
                className="p-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <span aria-hidden="true" className="text-sm font-bold">A-</span>
              </button>
              <button
                onClick={increaseFontSize}
                aria-label="Increase font size"
                className="p-3 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <span aria-hidden="true" className="text-lg font-bold">A+</span>
              </button>
              <button
                onClick={toggleHighContrast}
                aria-label={
                  highContrast
                    ? 'Disable high contrast mode'
                    : 'Enable high contrast mode'
                }
                aria-pressed={highContrast}
                className={`p-3 rounded-lg transition-colors ${
                  highContrast
                    ? 'bg-yellow-400 text-black'
                    : 'hover:bg-primary-700'
                }`}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 2v16a8 8 0 000-16z" />
                </svg>
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
