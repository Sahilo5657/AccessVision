import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

export default function InstallPrompt({ deferredPrompt, onInstallSuccess }) {
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('av_pwa_install_dismissed') === 'true';
  });

  useEffect(() => {
    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    }
  }, []);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('av_pwa_install_dismissed', 'true');
  };

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        if (onInstallSuccess) onInstallSuccess();
        handleDismiss();
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  // Only show if deferredPrompt exists or on iOS device not already installed
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <aside
        className="a2hs-banner"
        role="complementary"
        aria-label="Install AccessVision app prompt"
      >
        <div className="a2hs-content">
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Smartphone size={22} color="#ffffff" aria-hidden="true" />
          </div>
          <div>
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Install AccessVision as Standalone App
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Enjoy full offline reading, faster launch, and full-screen accessibility on your mobile or desktop.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className="action-btn primary"
            onClick={handleNativeInstall}
            aria-label="Install AccessVision App Now"
          >
            <Download size={16} aria-hidden="true" />
            <span>Install</span>
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={handleDismiss}
            aria-label="Dismiss installation banner for now"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </aside>

      {/* iOS Safari Walkthrough Modal */}
      {showIOSModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowIOSModal(false)}
          role="presentation"
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-modal-title"
          >
            <div className="modal-header">
              <h2 id="ios-modal-title" className="modal-title">
                <Share size={22} aria-hidden="true" color="#38bdf8" />
                <span>How to Install on iPhone & iPad</span>
              </h2>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowIOSModal(false)}
                aria-label="Close iOS install guide"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <ol
              style={{
                listStyle: 'decimal',
                paddingLeft: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                fontSize: '0.95rem',
                lineHeight: 1.6
              }}
            >
              <li>
                In Safari, tap the <strong>Share</strong> button{' '}
                <span className="kbd-badge" style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                  <Share size={14} aria-hidden="true" /> Share
                </span>{' '}
                at the bottom bar of your screen.
              </li>
              <li>
                Scroll down the action sheet and select{' '}
                <span className="kbd-badge" style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
                  <PlusSquare size={14} aria-hidden="true" /> Add to Home Screen
                </span>.
              </li>
              <li>
                Tap <strong>Add</strong> in the top-right corner. AccessVision will now appear on your home screen like a native iOS app!
              </li>
            </ol>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="action-btn primary"
                onClick={() => setShowIOSModal(false)}
              >
                <Check size={16} aria-hidden="true" />
                <span>Got it!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
