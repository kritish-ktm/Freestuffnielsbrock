// src/components/CookieBanner.jsx
// Add <CookieBanner /> inside App.js, just before </> at the bottom of the return.
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Small delay so it doesn't flash on initial load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setVisible(false);
  };

  const decline = () => {
    // We still need essential cookies to function, but we respect the choice
    localStorage.setItem("cookie_consent", "essential_only");
    localStorage.setItem("cookie_consent_date", new Date().toISOString());
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Sora:wght@600;700&display=swap');

        .cookie-overlay {
          position: fixed;
          inset: 0;
          z-index: 9998;
          pointer-events: none;
        }

        .cookie-banner {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          width: calc(100% - 2rem);
          max-width: 680px;
          background: rgba(8, 15, 35, 0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 1.25rem 1.5rem;
          box-shadow:
            0 0 0 1px rgba(0,95,163,0.25),
            0 24px 60px rgba(0,0,0,0.7),
            inset 0 1px 0 rgba(255,255,255,0.08);
          font-family: 'DM Sans', sans-serif;
          animation: bannerSlideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
        }

        @keyframes bannerSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(30px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .cookie-top {
          display: flex; align-items: flex-start; gap: 14px;
        }

        .cookie-icon-wrap {
          width: 42px; height: 42px; flex-shrink: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(0,48,135,0.6), rgba(0,95,163,0.4));
          border: 1px solid rgba(0,95,163,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
        }

        .cookie-text h4 {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem; font-weight: 700;
          color: #fff; margin: 0 0 0.3rem;
        }
        .cookie-text p {
          color: rgba(255,255,255,0.5);
          font-size: 0.83rem; line-height: 1.6; margin: 0;
        }
        .cookie-text a { color: #7FD856; text-decoration: none; }
        .cookie-text a:hover { text-decoration: underline; }

        /* Expanded detail panel */
        .cookie-details {
          max-height: 0; overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .cookie-details.open { max-height: 400px; }
        .cookie-details-inner {
          padding-top: 1rem; margin-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .cookie-detail-title {
          font-size: 0.75rem; font-weight: 600;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .cookie-row {
          display: flex; align-items: flex-start; gap: 10px;
          margin-bottom: 0.75rem;
        }
        .cookie-row-dot {
          width: 8px; height: 8px; border-radius: 50%;
          flex-shrink: 0; margin-top: 5px;
        }
        .dot-green  { background: #7FD856; box-shadow: 0 0 6px rgba(127,216,86,0.6); }
        .dot-blue   { background: #00a9e0; box-shadow: 0 0 6px rgba(0,169,224,0.6); }
        .dot-yellow { background: #d4af37; box-shadow: 0 0 6px rgba(212,175,55,0.6); }
        .cookie-row-label { font-size: 0.82rem; color: rgba(255,255,255,0.75); font-weight: 500; }
        .cookie-row-desc  { font-size: 0.78rem; color: rgba(255,255,255,0.4); margin-top: 1px; }

        /* Buttons */
        .cookie-actions {
          display: flex; align-items: center; gap: 0.6rem;
          margin-top: 1.1rem; flex-wrap: wrap;
        }

        .btn-cookie-accept {
          background: linear-gradient(135deg, #003087, #005fa3);
          border: none; border-radius: 10px; color: #fff;
          font-family: 'Sora', sans-serif; font-weight: 600;
          font-size: 0.85rem; padding: 0.6rem 1.4rem;
          cursor: pointer; white-space: nowrap;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 3px 12px rgba(0,48,135,0.4);
        }
        .btn-cookie-accept:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,48,135,0.5); }

        .btn-cookie-essential {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 10px; color: rgba(255,255,255,0.65);
          font-family: 'Sora', sans-serif; font-weight: 500;
          font-size: 0.85rem; padding: 0.6rem 1.2rem;
          cursor: pointer; white-space: nowrap;
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-cookie-essential:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.25); }

        .btn-cookie-toggle {
          background: none; border: none;
          color: rgba(255,255,255,0.35); font-size: 0.8rem;
          cursor: pointer; padding: 0.5rem 0.5rem;
          transition: color 0.2s; margin-left: auto;
          font-family: 'DM Sans', sans-serif;
          white-space: nowrap;
        }
        .btn-cookie-toggle:hover { color: rgba(255,255,255,0.7); }

        @media(max-width: 480px) {
          .cookie-banner { bottom: 0.75rem; padding: 1rem; border-radius: 16px; }
          .btn-cookie-toggle { margin-left: 0; }
        }
      `}</style>

      <div className="cookie-banner" role="dialog" aria-label="Cookie consent">
        <div className="cookie-top">
          <div className="cookie-icon-wrap">🍪</div>
          <div className="cookie-text">
            <h4>We use cookies</h4>
            <p>
              We use essential cookies to keep you signed in and save your preferences. No tracking, no ads.
              See our <Link to="/terms" onClick={accept}>Terms</Link> and <Link to="/privacy" onClick={accept}>Privacy Policy</Link> for details.
            </p>
          </div>
        </div>

        {/* Expandable detail */}
        <div className={`cookie-details ${expanded ? "open" : ""}`}>
          <div className="cookie-details-inner">
            <p className="cookie-detail-title">What we store</p>
            <div className="cookie-row">
              <div className="cookie-row-dot dot-green" />
              <div>
                <div className="cookie-row-label">Authentication session <span style={{color:"rgba(127,216,86,0.7)",fontSize:"0.72rem",marginLeft:4}}>Essential</span></div>
                <div className="cookie-row-desc">Keeps you logged in via Supabase. Required for the Platform to work.</div>
              </div>
            </div>
            <div className="cookie-row">
              <div className="cookie-row-dot dot-blue" />
              <div>
                <div className="cookie-row-label">Interested items list</div>
                <div className="cookie-row-desc">Saved locally in your browser — never sent to our servers.</div>
              </div>
            </div>
            <div className="cookie-row">
              <div className="cookie-row-dot dot-yellow" />
              <div>
                <div className="cookie-row-label">UI preferences</div>
                <div className="cookie-row-desc">Search filters and display preferences — local only, never shared.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="cookie-actions">
          <button className="btn-cookie-accept" onClick={accept}>
            Accept all
          </button>
          <button className="btn-cookie-essential" onClick={decline}>
            Essential only
          </button>
          <button className="btn-cookie-toggle" onClick={() => setExpanded(!expanded)}>
            {expanded ? "Less info ▲" : "More info ▼"}
          </button>
        </div>
      </div>
    </>
  );
}

export default CookieBanner;