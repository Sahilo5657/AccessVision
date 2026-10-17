/**
 * AboutPage – Project Information & Extension Installation Guide
 *
 * Provides information about:
 * - The AccessVision project mission
 * - How to install and use the browser extension
 * - Screen reader testing instructions
 * - Team and acknowledgments
 *
 * @module AboutPage
 */
import React, { useEffect } from 'react';
import { useFocusTarget } from '../hooks/useFocusManagement';

export const AboutPage: React.FC = () => {
  const { targetRef, focusTarget } = useFocusTarget<HTMLHeadingElement>();

  useEffect(() => {
    focusTarget();
    document.title = 'About – AccessVision Hub';
  }, [focusTarget]);

  return (
    <section aria-labelledby="about-heading" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <header className="mb-12">
          <h1
            id="about-heading"
            ref={targetRef}
            tabIndex={-1}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            About AccessVision
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            A final-year university project dedicated to making the web more
            accessible for visually impaired users through innovative assistive
            technology.
          </p>
        </header>

        {/* Mission Section */}
        <article
          aria-labelledby="mission-heading"
          className="card bg-white rounded-xl p-8 shadow-md border border-gray-100 mb-8"
        >
          <h2
            id="mission-heading"
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Our Mission
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            According to the World Health Organization, approximately 2.2
            billion people globally have a near or distance vision impairment.
            Despite significant advances in web standards and assistive
            technologies, many websites remain inaccessible, creating barriers
            to information, services, and social participation.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            AccessVision addresses this challenge through a two-pronged
            approach: a demonstration website that showcases best practices in
            accessible web design, and a browser extension that enhances the
            accessibility of existing websites in real-time.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Unlike commercial accessibility overlays that attempt to
            retroactively fix inaccessible sites (often introducing new
            problems), AccessVision provides genuine assistive tools—voice
            navigation, content summarization, landmark navigation—that work
            alongside existing page structures rather than overriding them.
          </p>
        </article>

        {/* Extension Installation */}
        <article
          aria-labelledby="install-heading"
          className="card bg-white rounded-xl p-8 shadow-md border border-gray-100 mb-8"
        >
          <h2
            id="install-heading"
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Installing the Browser Extension
          </h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm"
              >
                1
              </span>
              <div>
                <strong>Open Chrome or Edge extensions page</strong>
                <p className="text-gray-600 mt-1">
                  Navigate to{' '}
                  <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono">
                    chrome://extensions/
                  </code>{' '}
                  in your browser address bar.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm"
              >
                2
              </span>
              <div>
                <strong>Enable Developer Mode</strong>
                <p className="text-gray-600 mt-1">
                  Toggle the &quot;Developer mode&quot; switch in the top-right
                  corner of the extensions page.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm"
              >
                3
              </span>
              <div>
                <strong>Load the Extension</strong>
                <p className="text-gray-600 mt-1">
                  Click &quot;Load unpacked&quot; and select the{' '}
                  <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono">
                    extension/
                  </code>{' '}
                  folder from the AccessVision project directory.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm"
              >
                4
              </span>
              <div>
                <strong>Pin the Extension</strong>
                <p className="text-gray-600 mt-1">
                  Click the puzzle piece icon in the toolbar and pin
                  AccessVision for quick access.
                </p>
              </div>
            </li>
          </ol>
        </article>

        {/* Screen Reader Testing */}
        <article
          aria-labelledby="sr-testing-heading"
          className="card bg-white rounded-xl p-8 shadow-md border border-gray-100 mb-8"
        >
          <h2
            id="sr-testing-heading"
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            How to Test with Screen Readers
          </h2>

          <div className="space-y-6">
            {/* NVDA */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                NVDA (Windows – Free)
              </h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>
                  Download NVDA from{' '}
                  <a
                    href="https://www.nvaccess.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 underline hover:text-primary-800"
                  >
                    nvaccess.org
                    <span className="sr-only"> (opens in new tab)</span>
                  </a>
                </li>
                <li>
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">Ctrl+Alt+N</kbd> to
                  start NVDA
                </li>
                <li>
                  Use <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">H</kbd> to navigate by
                  headings, <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">D</kbd> for
                  landmarks
                </li>
                <li>
                  Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">Insert+F7</kbd> to
                  open the elements list
                </li>
                <li>
                  Use <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">Tab</kbd> to navigate
                  interactive elements
                </li>
              </ol>
            </div>

            {/* VoiceOver */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                VoiceOver (macOS – Built-in)
              </h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">
                    Cmd+F5
                  </kbd>{' '}
                  to toggle VoiceOver
                </li>
                <li>
                  Use{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">
                    VO+Right Arrow
                  </kbd>{' '}
                  (VO = Ctrl+Option) to move forward
                </li>
                <li>
                  Press{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">
                    VO+U
                  </kbd>{' '}
                  to open the rotor for headings, links, and landmarks
                </li>
                <li>
                  Use{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono">
                    VO+Cmd+H
                  </kbd>{' '}
                  to navigate by headings
                </li>
              </ol>
            </div>
          </div>
        </article>

        {/* Technology Stack */}
        <article
          aria-labelledby="tech-heading"
          className="card bg-white rounded-xl p-8 shadow-md border border-gray-100 mb-8"
        >
          <h2
            id="tech-heading"
            className="text-2xl font-bold text-gray-900 mb-4"
          >
            Technology Stack
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <caption className="sr-only">
                Technologies used in the AccessVision project
              </caption>
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th
                    scope="col"
                    className="py-3 px-4 text-sm font-semibold text-gray-700"
                  >
                    Component
                  </th>
                  <th
                    scope="col"
                    className="py-3 px-4 text-sm font-semibold text-gray-700"
                  >
                    Technologies
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    Demo Website
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    React 18, TypeScript, Vite, Tailwind CSS
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    Browser Extension
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Manifest V3, JavaScript, Web Speech API
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    Backend API
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Node.js, Express
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    Testing
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    Playwright, axe-core, NVDA, VoiceOver
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    Accessibility Standards
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    WCAG 2.2 Level AA, WAI-ARIA 1.2
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        {/* Accessibility Statement */}
        <article
          aria-labelledby="a11y-statement-heading"
          className="card bg-primary-50 rounded-xl p-8 border border-primary-200"
        >
          <h2
            id="a11y-statement-heading"
            className="text-2xl font-bold text-primary-900 mb-4"
          >
            Accessibility Statement
          </h2>
          <p className="text-primary-800 leading-relaxed mb-4">
            AccessVision is committed to ensuring digital accessibility for
            people of all abilities. We strive to conform to the Web Content
            Accessibility Guidelines (WCAG) 2.2 at Level AA.
          </p>
          <p className="text-primary-800 leading-relaxed mb-4">
            We regularly test this website with:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-primary-800 mb-4">
            <li>NVDA screen reader on Windows</li>
            <li>VoiceOver screen reader on macOS</li>
            <li>Keyboard-only navigation</li>
            <li>axe-core automated accessibility testing</li>
            <li>Lighthouse accessibility auditing</li>
            <li>Manual WCAG 2.2 checklist evaluation</li>
          </ul>
          <p className="text-primary-800 leading-relaxed">
            If you encounter any accessibility barriers on this website, please
            contact us through our feedback form. We take all accessibility
            reports seriously and will work to resolve issues promptly.
          </p>
        </article>
      </div>
    </section>
  );
};
