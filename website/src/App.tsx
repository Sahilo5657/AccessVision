/**
 * App – Root Application Component
 *
 * Sets up routing, layout structure, and global accessibility features:
 * - Skip navigation link
 * - Header with navigation
 * - Main content region with id for skip link target
 * - Footer
 * - Floating accessibility toolbar
 * - Focus management on route changes
 *
 * @module App
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SkipLink } from './components/SkipLink';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AccessibilityToolbar } from './components/AccessibilityToolbar';
import { HomePage } from './pages/HomePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ContactPage } from './pages/ContactPage';
import { AboutPage } from './pages/AboutPage';

/**
 * Root application component that provides the page layout
 * and client-side routing.
 */
const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Skip Link – first focusable element on the page */}
      <SkipLink targetId="main-content" />

      {/* Banner Landmark */}
      <Header />

      {/* Main Content Landmark */}
      <main
        id="main-content"
        role="main"
        aria-label="Page content"
        className="flex-1"
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <section className="py-20 px-4 text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Page Not Found
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  The page you are looking for does not exist or has been moved.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Return to Home
                </a>
              </section>
            }
          />
        </Routes>
      </main>

      {/* Content Info Landmark */}
      <Footer />

      {/* Floating Accessibility Controls */}
      <AccessibilityToolbar />
    </div>
  );
};

export default App;
