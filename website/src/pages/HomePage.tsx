/**
 * HomePage – Landing page for AccessVision Hub
 *
 * Explains the project mission, accessibility principles,
 * and provides navigation to key sections.
 *
 * Implements:
 * - Semantic heading hierarchy (single h1)
 * - Descriptive link text (no "click here")
 * - ARIA landmarks
 * - Meaningful alt text for images
 * - Accessible cards with proper focus management
 *
 * @module HomePage
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFocusTarget } from '../hooks/useFocusManagement';

/** Feature cards data */
const FEATURES = [
  {
    id: 'voice-control',
    title: 'Voice Control',
    description:
      'Navigate any website using voice commands. Say "Read page", "Next heading", or "Go to navigation" for hands-free browsing.',
    icon: (
      <svg aria-hidden="true" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    id: 'high-contrast',
    title: 'High Contrast Modes',
    description:
      'Instantly apply high-contrast color schemes to any webpage. Designed for users with low vision, color blindness, or light sensitivity.',
    icon: (
      <svg aria-hidden="true" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
  {
    id: 'page-summary',
    title: 'Page Summarization',
    description:
      'Get AI-assisted summaries of any webpage content. Understand page structure and content quickly without reading every word.',
    icon: (
      <svg aria-hidden="true" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'landmark-nav',
    title: 'Landmark Navigation',
    description:
      'Jump between page landmarks (navigation, main content, forms) with keyboard shortcuts or voice commands.',
    icon: (
      <svg aria-hidden="true" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'alt-text',
    title: 'AI Alt-Text Generator',
    description:
      'Automatically generates descriptive alternative text for images that lack it, improving comprehension for screen reader users.',
    icon: (
      <svg aria-hidden="true" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'reading-mode',
    title: 'Reading Mode',
    description:
      'Strip away visual clutter and present content in a clean, easy-to-read format with optimal line length and spacing.',
    icon: (
      <svg aria-hidden="true" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
] as const;

/** WCAG principles */
const PRINCIPLES = [
  {
    name: 'Perceivable',
    description:
      'Information and user interface components must be presentable to users in ways they can perceive.',
    examples: 'Text alternatives, captions, adaptable layouts, distinguishable colors.',
  },
  {
    name: 'Operable',
    description:
      'User interface components and navigation must be operable by all users.',
    examples: 'Keyboard accessible, no time limits, no seizure-inducing content, navigable.',
  },
  {
    name: 'Understandable',
    description:
      'Information and the operation of the user interface must be understandable.',
    examples: 'Readable text, predictable behavior, input assistance, error prevention.',
  },
  {
    name: 'Robust',
    description:
      'Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.',
    examples: 'Valid HTML, proper ARIA usage, compatible with screen readers.',
  },
] as const;

export const HomePage: React.FC = () => {
  const { targetRef, focusTarget } = useFocusTarget<HTMLHeadingElement>();

  // Move focus to heading on mount (for SPA navigation)
  useEffect(() => {
    focusTarget();
    document.title = 'AccessVision Hub – Web Accessibility for Visually Impaired People';
  }, [focusTarget]);

  return (
    <>
      {/* Hero Section */}
      <section
        aria-labelledby="hero-heading"
        className="bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900 text-white py-20 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h1
            id="hero-heading"
            ref={targetRef}
            tabIndex={-1}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight"
          >
            Making the Web
            <span className="block text-primary-200">Accessible for Everyone</span>
          </h1>
          <p className="text-xl sm:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            AccessVision helps visually impaired users browse the web more
            effectively through voice control, intelligent page analysis, and
            adaptive display modes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/articles"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-colors min-h-[2.75rem] text-lg"
            >
              Explore Articles
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary-800 transition-colors min-h-[2.75rem] text-lg"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section aria-labelledby="features-heading" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              id="features-heading"
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Browser Extension Features
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The AccessVision Assistant browser extension enhances any website
              with powerful accessibility tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <article
                key={feature.id}
                className="card bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                aria-labelledby={`feature-${feature.id}`}
              >
                <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3
                  id={`feature-${feature.id}`}
                  className="text-xl font-semibold text-gray-900 mb-3"
                >
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WCAG Principles Section */}
      <section aria-labelledby="principles-heading" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              id="principles-heading"
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              WCAG 2.2 Accessibility Principles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our system is built on the four foundational principles of web
              accessibility defined by the W3C.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRINCIPLES.map((principle, index) => (
              <article
                key={principle.name}
                className="card bg-white rounded-xl p-8 shadow-md border border-gray-100"
                aria-labelledby={`principle-${index}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex-shrink-0 w-10 h-10 bg-accent-100 text-accent-700 rounded-full flex items-center justify-center font-bold text-lg"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3
                      id={`principle-${index}`}
                      className="text-xl font-semibold text-gray-900 mb-2"
                    >
                      {principle.name}
                    </h3>
                    <p className="text-gray-600 mb-3 leading-relaxed">
                      {principle.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      <strong>Examples:</strong> {principle.examples}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        aria-labelledby="cta-heading"
        className="py-16 px-4 bg-primary-800 text-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            id="cta-heading"
            className="text-3xl sm:text-4xl font-bold mb-6"
          >
            Ready to Experience Accessible Browsing?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Install the AccessVision Assistant extension and transform how you
            interact with the web.
          </p>
          <Link
            to="/about"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-50 transition-colors text-lg min-h-[2.75rem]"
          >
            Get Started
          </Link>
        </div>
      </section>
    </>
  );
};
