import React from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import speechService from '../services/speechService';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function VoiceCommandsModal({
  isOpen,
  onClose,
  isListening,
  onToggleListening,
  transcript,
  lastCommand
}) {
  const { announce } = useAccessibility();

  if (!isOpen) return null;

  const handleSpeakHelp = () => {
    const helpText =
      'Available voice commands: Say "read" to start reading. Say "pause" to pause. Say "resume" to continue. Say "stop" to stop. Say "next" for the next sentence. Say "previous" for the previous sentence. Say "urdu" to switch to Urdu. Say "contrast" to change theme. Say "reading mode" for distraction-free view.';
    speechService.speak(helpText, { lang: 'en', rate: 1.0 });
    announce('Reading available voice commands aloud.');
  };

  const commandsList = [
    { command: '"Read" / "Play"', description: 'Begins reading the page content aloud sentence by sentence' },
    { command: '"Pause" / "Wait"', description: 'Pauses active speech synthesis' },
    { command: '"Resume" / "Continue"', description: 'Resumes reading from the current sentence' },
    { command: '"Stop"', description: 'Stops speech and resets to beginning' },
    { command: '"Next" / "Forward"', description: 'Skips ahead to the next sentence' },
    { command: '"Previous" / "Back"', description: 'Jumps back to the previous sentence' },
    { command: '"Urdu" / "اردو"', description: 'Switches reader and TTS to natural Urdu mode' },
    { command: '"English"', description: 'Switches reader and TTS to English mode' },
    { command: '"Contrast"', description: 'Cycles between high-contrast themes (Yellow, Cyan, Monochrome)' },
    { command: '"Reading Mode"', description: 'Toggles distraction-free clean reading view' },
    { command: '"Faster" / "Slower"', description: 'Increases or decreases speech playback speed' },
    { command: '"Help"', description: 'Reads aloud the list of available commands' }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="voice-modal-title" className="modal-title">
            <Mic size={24} aria-hidden="true" color="#ef4444" />
            <span>Hands-Free Voice Commands</span>
          </h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close voice commands dialog"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Listening Card & Visualizer */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            textAlign: 'center',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className={`playback-btn play-pause-big ${isListening ? 'mic-pulsing' : ''}`}
              style={{
                margin: '0 auto',
                background: isListening ? '#ef4444' : 'var(--accent-primary)',
                borderColor: isListening ? '#f87171' : 'var(--accent-cyan)'
              }}
              onClick={onToggleListening}
              aria-label={isListening ? 'Stop Voice Listening' : 'Start Voice Listening'}
            >
              {isListening ? (
                <MicOff size={28} aria-hidden="true" />
              ) : (
                <Mic size={28} aria-hidden="true" />
              )}
            </button>
          </div>

          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.3rem' }}>
            {isListening ? 'Listening for your commands...' : 'Microphone Inactive'}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isListening
              ? 'Speak clearly into your microphone or phone. Say "Read", "Urdu", "Pause", etc.'
              : 'Tap the microphone button above to start hands-free voice control.'}
          </p>

          {/* Live Transcript Box */}
          <div
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-subtle)',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              color: transcript ? 'var(--accent-cyan)' : 'var(--text-muted)'
            }}
            role="status"
            aria-live="polite"
          >
            {transcript ? `"${transcript}"` : 'Your spoken words will appear here...'}
          </div>

          {lastCommand && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#4ade80', fontWeight: 700 }}>
              ✓ Recognized: {lastCommand}
            </div>
          )}
        </div>

        {/* Read Help Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Available Voice Commands</h3>
          <button
            type="button"
            className="action-btn"
            style={{ minHeight: '38px', padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
            onClick={handleSpeakHelp}
            title="Read command list aloud"
          >
            <Volume2 size={16} aria-hidden="true" />
            <span>Read Commands Aloud</span>
          </button>
        </div>

        {/* Command list */}
        <table className="shortcuts-table" aria-label="Table of supported voice commands">
          <thead>
            <tr>
              <th scope="col" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Say</th>
              <th scope="col" style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {commandsList.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <span className="kbd-badge" style={{ color: 'var(--accent-gold)' }}>
                    {item.command}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
