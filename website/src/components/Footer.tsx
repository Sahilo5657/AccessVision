/**
 * Footer – Accessible Site Footer
 *
 * Implements:
 * - Landmark: <footer> with role="contentinfo"
 * - Navigation links with proper aria-labels
 * - Current year auto-update
 *
 * @module Footer
 */
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      className="bg-gray-900 text-gray-300 mt-auto"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              AccessVision
            </h2>
            <p className="text-sm leading-relaxed">
              A comprehensive web accessibility system designed to make the
              internet more usable for visually impaired people. Built with
              WCAG 2.2 AA compliance at its core.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h2 className="text-lg font-semibold text-white mb-4">
              Quick Links
            </h2>
            <ul className="space-y-2" role="list">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/articles"
                  className="text-sm hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Articles
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm hover:text-white transition-colors underline-offset-4 hover:underline"
                >
                  About
                </Link>
              </li>
            </ul>
          </nav>

          {/* Accessibility Statement */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">
              Accessibility
            </h2>
            <p className="text-sm leading-relaxed mb-3">
              This website is designed to conform to WCAG 2.2 Level AA
              standards. We continuously test with screen readers and
              automated tools.
            </p>
            <p className="text-sm leading-relaxed">
              If you encounter any accessibility barriers, please{' '}
              <Link
                to="/contact"
                className="text-primary-300 hover:text-white underline transition-colors"
              >
                contact us
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {currentYear} AccessVision Project. Licensed under{' '}
            <a
              href="https://opensource.org/licenses/MIT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-300 hover:text-white underline transition-colors"
            >
              MIT License
              <span className="sr-only"> (opens in new tab)</span>
            </a>
            .
          </p>
          <p className="text-sm">
            Built with{' '}
            <span aria-label="accessibility" role="img">
              ♿
            </span>{' '}
            accessibility at the core.
          </p>
        </div>
      </div>
    </footer>
  );
};
