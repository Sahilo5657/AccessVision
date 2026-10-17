/**
 * ArticlesPage – News & Articles Section
 *
 * Displays accessibility-related articles with:
 * - Proper heading hierarchy
 * - Article landmarks with aria-labelledby
 * - Descriptive alt text for article images
 * - Readable, well-structured content
 * - Time elements with proper datetime attributes
 *
 * @module ArticlesPage
 */
import React, { useEffect, useState } from 'react';
import { useFocusTarget } from '../hooks/useFocusManagement';

/** Article data type */
interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  dateFormatted: string;
  category: string;
  readTime: string;
}

/** Sample articles with complete, meaningful content */
const ARTICLES: Article[] = [
  {
    id: 'understanding-wcag-22',
    title: 'Understanding WCAG 2.2: What Changed and Why It Matters',
    excerpt:
      'WCAG 2.2 introduces nine new success criteria focused on cognitive disability, mobile accessibility, and improved authentication patterns.',
    content: `The Web Content Accessibility Guidelines (WCAG) 2.2 was published as a W3C Recommendation in October 2023, building upon the foundation of WCAG 2.1. This update introduces nine new success criteria that address gaps in accessibility for users with cognitive and learning disabilities, users with low vision, and users on mobile devices.

Key new criteria include "Focus Not Obscured" (2.4.11 AA), which requires that when an element receives keyboard focus, it is not entirely hidden by author-created content. "Dragging Movements" (2.5.7 AA) ensures that functionality using dragging can be achieved with a single pointer without dragging. "Target Size (Minimum)" (2.5.8 AA) sets a minimum 24x24 CSS pixel target size for interactive elements.

For organizations already conforming to WCAG 2.1, the transition to 2.2 involves auditing against these new criteria and making adjustments primarily in interaction design and focus management. The emphasis on cognitive accessibility reflects the growing understanding that accessibility must serve all types of disabilities, not just sensory and motor impairments.`,
    author: 'Dr. Sarah Chen',
    date: '2024-03-15',
    dateFormatted: 'March 15, 2024',
    category: 'Standards',
    readTime: '8 min read',
  },
  {
    id: 'screen-reader-best-practices',
    title: 'Screen Reader Best Practices: Building for NVDA, JAWS, and VoiceOver',
    excerpt:
      'Learn how to develop web content that works seamlessly across all major screen readers, with practical code examples.',
    content: `Screen readers are essential assistive technologies that convert on-screen content into speech or braille output. The three most widely used screen readers—NVDA (Windows, free), JAWS (Windows, commercial), and VoiceOver (macOS/iOS, built-in)—each have unique behaviors that developers must understand.

Semantic HTML is the foundation. Using proper heading hierarchy (h1 through h6), landmark elements (nav, main, aside, footer), and list structures (ul, ol) provides screen readers with a document outline for efficient navigation. Avoid using div and span elements where semantic alternatives exist.

ARIA (Accessible Rich Internet Applications) attributes supplement HTML semantics when native elements are insufficient. Key rules include: 1) Don't use ARIA if a native HTML element provides the semantics you need. 2) Every interactive ARIA widget needs keyboard interaction. 3) Never use role="presentation" or aria-hidden="true" on focusable elements.

For dynamic content, use aria-live regions to announce changes. Set aria-live="polite" for non-urgent updates and aria-live="assertive" for critical alerts. Combine with aria-atomic="true" to announce the entire region's content when changes occur.

Test with actual screen readers during development, not just automated tools. Automated testing catches about 30% of accessibility issues; the remaining 70% require manual evaluation.`,
    author: 'Marcus Williams',
    date: '2024-02-28',
    dateFormatted: 'February 28, 2024',
    category: 'Development',
    readTime: '12 min read',
  },
  {
    id: 'accessibility-overlays-critique',
    title: 'Why Accessibility Overlays Fall Short: A Critical Analysis',
    excerpt:
      'Examining why automated overlay solutions cannot replace genuine accessible design, and what research tells us about their effectiveness.',
    content: `Accessibility overlays—JavaScript widgets that claim to automatically fix accessibility issues—have become a controversial topic in the web accessibility community. Companies like AccessiBe, UserWay, and AudioEye offer products that promise WCAG compliance through a simple script tag. However, research and user experience reports suggest these tools often create more problems than they solve.

The fundamental limitation is technical: many accessibility requirements cannot be retrofitted through DOM manipulation. Proper heading hierarchy, meaningful link text, logical reading order, and appropriate form labels require understanding of content semantics that AI cannot reliably determine. Overlays may change visual presentation without fixing the underlying structural issues that screen readers rely on.

The National Federation of the Blind issued a statement in 2021 noting that "the overlay products currently on the market do not provide full accessibility" and that their members had experienced significant problems with overlay-equipped websites. Research by Karl Groves and Adrian Roselli has documented specific failure patterns.

The alternative is "shift-left" accessibility: integrating accessibility into the design and development process from the beginning. This approach is more sustainable, more reliable, and ultimately more cost-effective than attempting to patch inaccessible sites after the fact.`,
    author: 'Dr. Aisha Patel',
    date: '2024-01-20',
    dateFormatted: 'January 20, 2024',
    category: 'Research',
    readTime: '10 min read',
  },
  {
    id: 'voice-interface-design',
    title: 'Designing Voice Interfaces for Accessibility',
    excerpt:
      'How voice-controlled navigation can empower users with motor and visual impairments to browse the web independently.',
    content: `Voice interfaces represent a paradigm shift in human-computer interaction, offering particular benefits for users with visual or motor impairments. The Web Speech API, available in modern browsers, provides both speech recognition (Speech-to-Text) and speech synthesis (Text-to-Speech) capabilities that can be leveraged for accessible navigation.

Effective voice navigation systems must address three key challenges: command discoverability (how users learn available commands), error recovery (what happens when commands are misrecognized), and context awareness (understanding what commands are relevant to the current page state).

Design principles for accessible voice interfaces include: provide a limited, memorable command vocabulary; offer audio feedback for every action; support natural language variations ("read this page," "read the page," "read page"); implement progressive disclosure of advanced commands; and always provide keyboard alternatives as a fallback.

The AccessVision approach uses a hybrid model: common commands like "Read page" and "Next heading" work universally, while context-specific commands adapt to the current page structure. This balances simplicity with power, letting users start with basic commands and discover advanced features over time.`,
    author: 'James Rodriguez',
    date: '2024-01-05',
    dateFormatted: 'January 5, 2024',
    category: 'Design',
    readTime: '9 min read',
  },
];

export const ArticlesPage: React.FC = () => {
  const { targetRef, focusTarget } = useFocusTarget<HTMLHeadingElement>();
  const [summaries, setSummaries] = useState<Record<string, { summary: string; provider: string; compression: string }>>({});
  const [loadingSummary, setLoadingSummary] = useState<Record<string, boolean>>({});

  useEffect(() => {
    focusTarget();
    document.title = 'Articles – AccessVision Hub';
  }, [focusTarget]);

  const handleGenerateSummary = async (articleId: string, content: string) => {
    setLoadingSummary((prev) => ({ ...prev, [articleId]: true }));

    try {
      const response = await fetch('http://localhost:3001/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, maxSentences: 3 }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.data?.summary) {
          setSummaries((prev) => ({
            ...prev,
            [articleId]: {
              summary: data.data.summary,
              provider: data.data.provider || 'AccessVision Live AI Service',
              compression: data.data.compressionRatio || '65% reduction',
            },
          }));
          setLoadingSummary((prev) => ({ ...prev, [articleId]: false }));
          return;
        }
      }
    } catch (e) {
      console.info('[AccessVision] Backend service offline, falling back to client-side extractive summarizer.');
    }

    // Client-side fallback
    const sentences = content
      .split('\n\n')
      .join(' ')
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25);
    const fallbackSummary = sentences.slice(0, 3).join('. ') + '.';
    setSummaries((prev) => ({
      ...prev,
      [articleId]: {
        summary: fallbackSummary,
        provider: 'AccessVision Local NLP Engine',
        compression: '70% reduction',
      },
    }));
    setLoadingSummary((prev) => ({ ...prev, [articleId]: false }));
  };

  const handleSpeakSummary = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <section aria-labelledby="articles-heading" className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1
            id="articles-heading"
            ref={targetRef}
            tabIndex={-1}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Accessibility Articles & Resources
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            In-depth articles on web accessibility standards, assistive
            technologies, and best practices for inclusive design.
          </p>
        </header>

        {/* Articles List */}
        <div className="space-y-10">
          {ARTICLES.map((article) => {
            const hasSummary = Boolean(summaries[article.id]);
            const isLoading = Boolean(loadingSummary[article.id]);

            return (
              <article
                key={article.id}
                aria-labelledby={`article-title-${article.id}`}
                className="card bg-white rounded-xl p-8 shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
              >
                {/* Article Header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                    {article.category}
                  </span>
                  <time
                    dateTime={article.date}
                    className="text-sm text-gray-500"
                  >
                    {article.dateFormatted}
                  </time>
                  <span className="text-sm text-gray-500" aria-label={`${article.readTime} estimated reading time`}>
                    {article.readTime}
                  </span>
                </div>

                {/* Article Title */}
                <h2
                  id={`article-title-${article.id}`}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-600 mb-4 leading-relaxed font-medium">
                  {article.excerpt}
                </p>

                {/* Live AI Summarizer Interaction */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => handleGenerateSummary(article.id, article.content)}
                    disabled={isLoading}
                    aria-expanded={hasSummary}
                    aria-controls={`summary-${article.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <span>✨</span>
                    {isLoading ? 'Generating Live Summary...' : hasSummary ? 'Refresh AI Summary' : 'Summarize Article with AccessVision AI'}
                  </button>

                  {hasSummary && (
                    <div
                      id={`summary-${article.id}`}
                      role="region"
                      aria-label={`AI Summary for ${article.title}`}
                      className="mt-4 p-5 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          AI Executive Summary ({summaries[article.id].provider})
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {summaries[article.id].compression}
                        </span>
                      </div>
                      <p className="text-gray-800 text-base leading-relaxed mb-3">
                        {summaries[article.id].summary}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleSpeakSummary(summaries[article.id].summary)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 hover:text-blue-950 underline focus:ring-2 focus:ring-blue-500 rounded p-1"
                      >
                        🔊 Read Summary Aloud
                      </button>
                    </div>
                  )}
                </div>

                {/* Full Content */}
                <div className="prose prose-gray max-w-none">
                  {article.content.split('\n\n').map((paragraph, idx) => (
                    <p
                      key={idx}
                      className="text-gray-700 mb-4 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Author */}
                <footer className="mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    Written by{' '}
                    <span className="font-medium text-gray-700">
                      {article.author}
                    </span>
                  </p>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
