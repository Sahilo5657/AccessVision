import React, { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
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

  const shortcuts = [
    { key: 'Space', description: 'Play / Pause reading' },
    { key: 'S', description: 'Stop reading and reset position' },
    { key: 'R', description: 'Resume reading' },
    { key: '→ (Right Arrow)', description: 'Skip to next sentence' },
    { key: '← (Left Arrow)', description: 'Jump to previous sentence' },
    { key: 'C or H', description: 'Cycle high-contrast theme' },
    { key: 'M', description: 'Toggle distraction-free Reading Mode' },
    { key: 'U', description: 'Switch to Urdu language and voice (اردو)' },
    { key: 'E', description: 'Switch to English language and voice' },
    { key: '+ / -', description: 'Increase / Decrease font size' },
    { key: '?', description: 'Open this keyboard shortcuts modal' },
    { key: 'Escape', description: 'Close any modal or dialog' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-modal-title"
      >
        <div className="modal-header">
          <h2 id="shortcuts-modal-title" className="modal-title">
            <Keyboard size={24} aria-hidden="true" color="#38bdf8" />
            <span>Accessible Keyboard Shortcuts</span>
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          AccessVision provides full keyboard accessibility without requiring a mouse. Use these shortcuts from anywhere in the app:
        </p>

        <table className="shortcuts-table" aria-label="Table of keyboard shortcuts">
          <thead>
            <tr>
              <th scope="col" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Shortcut Key</th>
              <th scope="col" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {shortcuts.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <span className="kbd-badge">{item.key}</span>
                </td>
                <td style={{ fontSize: '0.9rem' }}>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
