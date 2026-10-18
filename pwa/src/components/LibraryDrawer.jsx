import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  FilePlus,
  Check,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import { SAMPLE_ARTICLES, saveCustomArticle, getCustomArticles } from '../services/sampleLibrary';
import { usePlayback } from '../contexts/PlaybackContext';
import { detectLanguage } from '../services/urduDetector';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function LibraryDrawer({ isOpen, onClose }) {
  const { currentArticle, loadArticle } = usePlayback();
  const { announce } = useAccessibility();

  const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'custom'
  const [customTitle, setCustomTitle] = useState('');
  const [customText, setCustomText] = useState('');
  const [customList, setCustomList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setCustomList(getCustomArticles());
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const detectedLang = customText ? detectLanguage(customText) : 'en';

  const handleSelectArticle = (article) => {
    loadArticle(article, true);
    onClose();
  };

  const handleSaveAndReadCustom = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const saved = saveCustomArticle(
      customTitle || (detectedLang === 'ur' ? 'حسب ضرورت تحریر' : 'Custom Reading Document'),
      customText,
      detectedLang
    );

    loadArticle(saved, true);
    setCustomTitle('');
    setCustomText('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="library-modal-title"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h2 id="library-modal-title" className="modal-title">
            <BookOpen size={24} aria-hidden="true" color="#38bdf8" />
            <span>Reading Library & Custom Content</span>
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close reading library dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          role="tablist"
          aria-label="Library content selection"
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'curated'}
            className={`action-btn ${activeTab === 'curated' ? 'primary' : ''}`}
            onClick={() => setActiveTab('curated')}
          >
            <Layers size={16} aria-hidden="true" />
            <span>Curated Library (English & اردو)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'custom'}
            className={`action-btn ${activeTab === 'custom' ? 'primary' : ''}`}
            onClick={() => setActiveTab('custom')}
          >
            <FilePlus size={16} aria-hidden="true" />
            <span>Paste Custom Text</span>
          </button>
        </div>

        {/* Tab 1: Curated Library */}
        {activeTab === 'curated' && (
          <div className="article-cards-grid" role="region" aria-label="Available curated articles">
            {SAMPLE_ARTICLES.map((article) => {
              const isSelected = currentArticle.id === article.id;
              const isUrdu = article.lang === 'ur';

              return (
                <div
                  key={article.id}
                  className={`article-card ${isSelected ? 'active' : ''} ${isUrdu ? 'article-card-urdu' : ''}`}
                  onClick={() => handleSelectArticle(article)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectArticle(article);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${article.title}. Language: ${isUrdu ? 'Urdu' : 'English'}. Category: ${article.category}. Click to open and read.`}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span className="brand-badge" style={{ fontSize: '0.65rem' }}>
                        {article.category}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {isUrdu ? '🇵🇰 اردو' : '🇬🇧 English'}
                      </span>
                    </div>

                    <h3
                      className="card-title"
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        lineHeight: 1.35,
                        marginBottom: '0.5rem',
                        color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)'
                      }}
                    >
                      {article.title}
                    </h3>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {article.summary}
                    </p>
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {article.author}
                    </span>
                    {isSelected && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#4ade80', fontWeight: 700 }}>
                        <Check size={14} aria-hidden="true" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Custom Text / Paste */}
        {activeTab === 'custom' && (
          <form onSubmit={handleSaveAndReadCustom} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label htmlFor="custom-title-input" style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                Document Title (Optional):
              </label>
              <input
                id="custom-title-input"
                type="text"
                placeholder="e.g. My Study Notes or Article"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="custom-textarea"
                style={{ minHeight: '44px', height: '44px' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label htmlFor="custom-text-input" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                  Paste Text to Read Aloud:
                </label>
                {customText.length > 0 && (
                  <span className="brand-badge">
                    Detected: {detectedLang === 'ur' ? '🇵🇰 Urdu' : '🇬🇧 English'}
                  </span>
                )}
              </div>
              <textarea
                id="custom-text-input"
                placeholder="Paste any article, notes, news story, or textbook paragraph here (English or اردو)..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="custom-textarea"
                rows={7}
                required
                style={{ direction: detectedLang === 'ur' ? 'rtl' : 'ltr' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="action-btn"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="action-btn primary"
                disabled={!customText.trim()}
              >
                <Sparkles size={16} aria-hidden="true" />
                <span>Start Reading Custom Text</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
