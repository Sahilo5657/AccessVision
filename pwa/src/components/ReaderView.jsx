import React, { useMemo } from 'react';
import {
  Clock,
  FileText,
  User,
  Calendar,
  X,
  Volume2,
  Sparkles
} from 'lucide-react';
import { usePlayback } from '../contexts/PlaybackContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { calculateTextStats } from '../services/urduDetector';

export default function ReaderView() {
  const {
    currentArticle,
    sentences,
    currentSentenceIndex,
    isPlaying,
    jumpToSentence
  } = usePlayback();

  const { readingMode, toggleReadingMode } = useAccessibility();

  const stats = useMemo(() => {
    return calculateTextStats(currentArticle.content);
  }, [currentArticle.content]);

  const progressPercent = useMemo(() => {
    if (!sentences.length) return 0;
    return Math.round(((currentSentenceIndex + 1) / sentences.length) * 100);
  }, [sentences.length, currentSentenceIndex]);

  const isUrduArticle = currentArticle.lang === 'ur';

  // Group sentences by original paragraphs for natural visual layout
  const paragraphs = useMemo(() => {
    const rawParagraphs = currentArticle.content.split(/\n\s*\n|\n/);
    let sentenceCounter = 0;

    return rawParagraphs.map((paraText, pIdx) => {
      const trimmed = paraText.trim();
      if (!trimmed) return null;

      // Find all sentences belonging to this paragraph
      const matchedSentences = [];
      while (
        sentenceCounter < sentences.length &&
        trimmed.includes(sentences[sentenceCounter].text.slice(0, 25))
      ) {
        matchedSentences.push(sentences[sentenceCounter]);
        sentenceCounter++;
      }

      // Fallback if strict match misses
      if (matchedSentences.length === 0 && sentenceCounter < sentences.length) {
        matchedSentences.push(sentences[sentenceCounter++]);
      }

      return {
        id: `para-${pIdx}`,
        sentences: matchedSentences
      };
    }).filter(Boolean);
  }, [currentArticle.content, sentences]);

  return (
    <article
      id="main-content"
      className={`reader-container ${isUrduArticle ? 'article-urdu' : ''}`}
      role="main"
      aria-labelledby="article-heading"
    >
      {/* Distraction-Free Exit Bar */}
      <div className="reading-mode-exit-bar" role="region" aria-label="Reading mode controls">
        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
          Distraction-Free Reading Mode
        </span>
        <button
          type="button"
          className="action-btn"
          onClick={toggleReadingMode}
          aria-label="Exit distraction-free reading mode"
        >
          <X size={18} aria-hidden="true" />
          <span>Exit Reading Mode</span>
        </button>
      </div>

      {/* Article Header Metadata */}
      <header className="article-header">
        <div className="article-category">
          <Sparkles size={14} aria-hidden="true" />
          <span>{currentArticle.category}</span>
        </div>

        <h1 id="article-heading" className="article-title">
          {currentArticle.title}
        </h1>

        <div className="article-meta" role="list" aria-label="Article details">
          <span className="article-meta-item" role="listitem">
            <User size={15} aria-hidden="true" />
            <span>{currentArticle.author}</span>
          </span>
          <span className="article-meta-item" role="listitem">
            <Calendar size={15} aria-hidden="true" />
            <span>{currentArticle.date}</span>
          </span>
          <span className="article-meta-item" role="listitem">
            <FileText size={15} aria-hidden="true" />
            <span>{stats.wordCount} words</span>
          </span>
          <span className="article-meta-item" role="listitem">
            <Clock size={15} aria-hidden="true" />
            <span>~{stats.readingTimeMinutes} min listen</span>
          </span>
        </div>

        {/* Live Audio Progress Bar */}
        <div
          className="reading-progress-wrapper"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`Reading progress: ${progressPercent} percent completed`}
          title={`Reading progress: ${progressPercent}%`}
        >
          <div
            className="reading-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Full Content Body with Sentence Highlighting */}
      <div className="reader-article-content">
        {paragraphs.map((para) => (
          <p key={para.id} className="reader-paragraph">
            {para.sentences.map((s) => {
              const isCurrent = isPlaying && s.index === currentSentenceIndex;
              return (
                <span
                  key={`s-${s.index}`}
                  id={`sentence-${s.index}`}
                  className={`reader-sentence ${isCurrent ? 'av-active-sentence' : ''}`}
                  onClick={() => jumpToSentence(s.index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      jumpToSentence(s.index);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isCurrent}
                  aria-label={`Sentence ${s.index + 1}: ${s.text}. Click or press Enter to read aloud.`}
                >
                  {s.text}{' '}
                </span>
              );
            })}
          </p>
        ))}
      </div>
    </article>
  );
}
