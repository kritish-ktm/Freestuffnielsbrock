// src/pages/TermsOfService.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";

const sections = [
  { id: "acceptance",    icon: "bi-file-check",        title: "1. Acceptance of Terms" },
  { id: "eligibility",   icon: "bi-mortarboard",       title: "2. Eligibility" },
  { id: "accounts",      icon: "bi-person-lock",       title: "3. User Accounts" },
  { id: "conduct",       icon: "bi-shield-check",      title: "4. Acceptable Use" },
  { id: "listings",      icon: "bi-tag",               title: "5. Listings & Items" },
  { id: "cookies",       icon: "bi-cookie",            title: "6. Cookies & Storage" },
  { id: "privacy",       icon: "bi-lock",              title: "7. Privacy & Data" },
  { id: "liability",     icon: "bi-exclamation-triangle", title: "8. Liability" },
  { id: "termination",   icon: "bi-x-circle",          title: "9. Termination" },
  { id: "changes",       icon: "bi-arrow-repeat",      title: "10. Changes to Terms" },
  { id: "governing",     icon: "bi-globe-europe-africa", title: "11. Governing Law" },
  { id: "contact",       icon: "bi-envelope",          title: "12. Contact Us" },
];

function TermsOfService() {
  const [activeSection, setActiveSection] = useState(null);

  const toggle = (id) => setActiveSection(activeSection === id ? null : id);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .tos-root {
          min-height: 100vh;
          background: #04091a;
          font-family: 'DM Sans', sans-serif;
          color: rgba(255,255,255,0.85);
          padding-bottom: 5rem;
        }

        /* Hero */
        .tos-hero {
          position: relative;
          padding: 5rem 1.5rem 3.5rem;
          text-align: center;
          overflow: hidden;
        }
        .tos-hero::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 0%, rgba(0,48,135,0.55) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(127,216,86,0.1) 0%, transparent 55%);
          pointer-events: none;
        }
        .tos-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(127,216,86,0.12);
          border: 1px solid rgba(127,216,86,0.25);
          border-radius: 50px; padding: 6px 16px;
          font-size: 0.8rem; color: #7FD856;
          font-weight: 600; margin-bottom: 1.5rem;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .tos-hero h1 {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2rem, 5vw, 3.2rem);
          font-weight: 800; color: #fff;
          margin-bottom: 1rem; letter-spacing: -1px;
        }
        .tos-hero p {
          color: rgba(255,255,255,0.45); max-width: 520px;
          margin: 0 auto 2rem; font-size: 1rem; line-height: 1.7;
        }
        .tos-meta {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 6px 14px;
          font-size: 0.82rem; color: rgba(255,255,255,0.4);
        }

        /* Layout */
        .tos-layout {
          max-width: 1000px; margin: 0 auto; padding: 0 1.5rem;
          display: grid; grid-template-columns: 220px 1fr; gap: 2rem;
        }
        @media(max-width: 768px) { .tos-layout { grid-template-columns: 1fr; } .tos-sidebar { display: none; } }

        /* Sidebar */
        .tos-sidebar {
          position: sticky; top: 100px; height: fit-content;
        }
        .tos-sidebar-title {
          font-family: 'Sora', sans-serif; font-size: 0.7rem;
          font-weight: 700; color: rgba(255,255,255,0.3);
          letter-spacing: 1.5px; text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .tos-nav-item {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 10px; border-radius: 8px;
          color: rgba(255,255,255,0.4); font-size: 0.8rem;
          cursor: pointer; transition: all 0.2s;
          text-decoration: none; margin-bottom: 2px;
          border: 1px solid transparent;
        }
        .tos-nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.05); }
        .tos-nav-item.active { color: #7FD856; background: rgba(127,216,86,0.08); border-color: rgba(127,216,86,0.2); }

        /* Accordion sections */
        .tos-section {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; margin-bottom: 0.75rem;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .tos-section:hover { border-color: rgba(255,255,255,0.14); }
        .tos-section.open { border-color: rgba(127,216,86,0.25); background: rgba(127,216,86,0.03); }

        .tos-section-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.4rem; cursor: pointer;
          user-select: none;
        }
        .tos-section-left { display: flex; align-items: center; gap: 12px; }
        .tos-section-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(0,48,135,0.4); border: 1px solid rgba(0,95,163,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem; color: #00a9e0;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .tos-section.open .tos-section-icon { background: rgba(127,216,86,0.15); border-color: rgba(127,216,86,0.3); color: #7FD856; }
        .tos-section-title { font-family: 'Sora', sans-serif; font-size: 0.95rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .tos-chevron { color: rgba(255,255,255,0.3); font-size: 0.85rem; transition: transform 0.25s; }
        .tos-section.open .tos-chevron { transform: rotate(180deg); color: #7FD856; }

        .tos-section-body {
          max-height: 0; overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .tos-section.open .tos-section-body { max-height: 1000px; }
        .tos-section-content {
          padding: 0 1.4rem 1.4rem;
          color: rgba(255,255,255,0.6); font-size: 0.9rem; line-height: 1.8;
        }
        .tos-section-content p { margin-bottom: 0.75rem; }
        .tos-section-content ul { padding-left: 1.25rem; margin-bottom: 0.75rem; }
        .tos-section-content li { margin-bottom: 0.4rem; }
        .tos-section-content strong { color: rgba(255,255,255,0.85); }
        .tos-section-content a { color: #7FD856; text-decoration: none; }
        .tos-section-content a:hover { text-decoration: underline; }

        /* Cookie explainer special card */
        .cookie-explainer {
          background: rgba(0,48,135,0.15);
          border: 1px solid rgba(0,95,163,0.3);
          border-radius: 12px; padding: 1.25rem;
          margin: 1rem 0;
        }
        .cookie-explainer-title {
          font-family: 'Sora', sans-serif; font-weight: 700;
          font-size: 0.85rem; color: #00a9e0;
          margin-bottom: 0.75rem; display: flex; align-items: center; gap: 7px;
        }
        .cookie-type-row {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 0.6rem 0; border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .cookie-type-row:last-child { border-bottom: none; padding-bottom: 0; }
        .cookie-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 6px; }
        .cookie-dot-green  { background: #7FD856; box-shadow: 0 0 6px rgba(127,216,86,0.5); }
        .cookie-dot-blue   { background: #00a9e0; box-shadow: 0 0 6px rgba(0,169,224,0.5); }
        .cookie-dot-yellow { background: #d4af37; box-shadow: 0 0 6px rgba(212,175,55,0.5); }
        .cookie-type-label { font-weight: 600; color: rgba(255,255,255,0.8); font-size: 0.85rem; }
        .cookie-type-desc  { color: rgba(255,255,255,0.45); font-size: 0.82rem; margin-top: 2px; }

        /* Back btn */
        .back-btn {
          display: inline-flex; align-items: center; gap: 7px;
          color: rgba(255,255,255,0.45); font-size: 0.875rem;
          text-decoration: none; padding: 8px 14px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px; background: rgba(255,255,255,0.04);
          transition: all 0.2s; margin-bottom: 2rem;
        }
        .back-btn:hover { color: rgba(255,255,255,0.9); border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.07); }

        /* Agree card at bottom */
        .agree-card {
          background: linear-gradient(135deg, rgba(0,48,135,0.3), rgba(0,95,163,0.2));
          border: 1px solid rgba(0,95,163,0.35);
          border-radius: 16px; padding: 2rem;
          text-align: center; margin-top: 1.5rem;
        }
        .agree-card h3 { font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; }
        .agree-card p { color: rgba(255,255,255,0.45); font-size: 0.875rem; margin-bottom: 1.25rem; }
        .agree-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #003087, #005fa3);
          color: #fff; border: none; border-radius: 12px;
          padding: 0.75rem 2rem; font-family: 'Sora', sans-serif;
          font-weight: 600; font-size: 0.95rem; cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(0,48,135,0.4);
        }
        .agree-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,48,135,0.55); color: #fff; }
      `}</style>

      <div className="tos-root">
        {/* Hero */}
        <div className="tos-hero">
          <div className="tos-hero-badge">
            <i className="bi bi-file-earmark-text" /> Legal Document
          </div>
          <h1>Terms &amp; Conditions</h1>
          <p>Please read these terms carefully before using Free Stuff Niels Brock. By signing in, you agree to all of them.</p>
          <div className="tos-meta">
            <i className="bi bi-calendar3" /> Last updated: February 2026
            &nbsp;&nbsp;·&nbsp;&nbsp;
            <i className="bi bi-globe-europe-africa" /> Governed by Danish law (GDPR compliant)
          </div>
        </div>

        <div className="tos-layout">
          {/* Sidebar navigation */}
          <aside className="tos-sidebar">
            <p className="tos-sidebar-title">Contents</p>
            {sections.map((s) => (
              <div key={s.id} className={`tos-nav-item ${activeSection === s.id ? "active" : ""}`} onClick={() => toggle(s.id)}>
                <i className={`bi ${s.icon}`} style={{ fontSize:"0.9rem" }} />
                <span>{s.title}</span>
              </div>
            ))}
            <div style={{ marginTop:"1.5rem", padding:"1rem", background:"rgba(127,216,86,0.07)", border:"1px solid rgba(127,216,86,0.18)", borderRadius:"10px" }}>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"0.78rem", margin:0, lineHeight:1.6 }}>
                Questions? Email us at{" "}
                <a href="mailto:freestuffnbcbc@gmail.com" style={{ color:"#7FD856" }}>freestuffnbcbc@gmail.com</a>
              </p>
            </div>
          </aside>

          {/* Main content */}
          <main>
            <Link to="/" className="back-btn">
              <i className="bi bi-arrow-left" /> Back to Home
            </Link>

            {/* 1. Acceptance */}
            <div className={`tos-section ${activeSection==="acceptance"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("acceptance")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-file-check"/></div>
                  <span className="tos-section-title">1. Acceptance of Terms</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>By accessing or using Free Stuff Niels Brock ("the Platform"), you confirm that you have read, understood, and agree to be bound by these Terms &amp; Conditions.</p>
                <p>If you do not agree to any part of these terms, you must not use the Platform. Continued use after any updates constitutes acceptance of the revised terms.</p>
              </div></div>
            </div>

            {/* 2. Eligibility */}
            <div className={`tos-section ${activeSection==="eligibility"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("eligibility")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-mortarboard"/></div>
                  <span className="tos-section-title">2. Eligibility</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>The Platform is exclusively available to <strong>current students of Niels Brock Copenhagen Business College</strong>.</p>
                <ul>
                  <li>You must have a valid Niels Brock student email ending in <strong>@edu.nielsbrock.dk</strong></li>
                  <li>You must be at least 13 years of age</li>
                  <li>You must not have been previously suspended or banned from the Platform</li>
                  <li>Providing false eligibility information may result in immediate account termination</li>
                </ul>
              </div></div>
            </div>

            {/* 3. Accounts */}
            <div className={`tos-section ${activeSection==="accounts"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("accounts")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-person-lock"/></div>
                  <span className="tos-section-title">3. User Accounts</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>You are responsible for maintaining the security of your account. This includes:</p>
                <ul>
                  <li>Keeping your login credentials confidential</li>
                  <li>Notifying us immediately if you suspect unauthorised access</li>
                  <li>Ensuring all profile information is accurate and up to date</li>
                  <li>Not sharing your account with other people</li>
                </ul>
                <p>We reserve the right to suspend or delete accounts that violate these terms.</p>
              </div></div>
            </div>

            {/* 4. Conduct */}
            <div className={`tos-section ${activeSection==="conduct"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("conduct")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-shield-check"/></div>
                  <span className="tos-section-title">4. Acceptable Use</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>You agree <strong>not</strong> to use the Platform to:</p>
                <ul>
                  <li>Harass, threaten, or intimidate other users</li>
                  <li>Post spam, misleading, or fraudulent content</li>
                  <li>List prohibited items (weapons, illegal substances, stolen goods)</li>
                  <li>Attempt to hack, scrape, or reverse-engineer the Platform</li>
                  <li>Impersonate another person or Niels Brock staff</li>
                  <li>Conduct any commercial activity or advertising</li>
                </ul>
                <p>Violations may result in immediate account suspension and potential reporting to Niels Brock administration.</p>
              </div></div>
            </div>

            {/* 5. Listings */}
            <div className={`tos-section ${activeSection==="listings"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("listings")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-tag"/></div>
                  <span className="tos-section-title">5. Listings &amp; Items</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>When posting an item you confirm that:</p>
                <ul>
                  <li>You are the rightful owner of the item</li>
                  <li>The description and photos are accurate and not misleading</li>
                  <li>The item is not prohibited under Danish law</li>
                  <li>You will remove the listing once the item is no longer available</li>
                </ul>
                <p>We reserve the right to remove any listing without notice if it violates these terms.</p>
                <p><strong>Transactions:</strong> The Platform facilitates connections between students — we are not a party to any transaction and accept no responsibility for disputes between users.</p>
              </div></div>
            </div>

            {/* 6. Cookies — detailed explainer */}
            <div className={`tos-section ${activeSection==="cookies"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("cookies")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-cookie"/></div>
                  <span className="tos-section-title">6. Cookies &amp; Storage — How They Work</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>
                  <strong>What is a cookie?</strong> A cookie is a tiny text file saved in your browser when you visit a website. It lets the site remember things about you — like that you're already logged in — so you don't have to start from scratch every time.
                </p>

                <div className="cookie-explainer">
                  <div className="cookie-explainer-title"><i className="bi bi-cookie"/>What we store and why</div>

                  <div className="cookie-type-row">
                    <div className="cookie-dot cookie-dot-green"/>
                    <div>
                      <div className="cookie-type-label">Authentication session (Essential)</div>
                      <div className="cookie-type-desc">Set by Supabase when you sign in. Keeps you logged in so you don't have to sign in every page visit. Expires when you sign out or after 7 days of inactivity. <strong>Cannot be disabled</strong> — the Platform won't work without it.</div>
                    </div>
                  </div>

                  <div className="cookie-type-row">
                    <div className="cookie-dot cookie-dot-blue"/>
                    <div>
                      <div className="cookie-type-label">localStorage — Interested items</div>
                      <div className="cookie-type-desc">Saves the list of items you've marked as interested so they persist between page reloads. Stored locally in your browser — never sent to our servers. You can clear this anytime in your browser settings.</div>
                    </div>
                  </div>

                  <div className="cookie-type-row">
                    <div className="cookie-dot cookie-dot-yellow"/>
                    <div>
                      <div className="cookie-type-label">localStorage — Preferences</div>
                      <div className="cookie-type-desc">Saves small UI preferences like search filters so they're remembered between visits. Fully local, never sent anywhere.</div>
                    </div>
                  </div>
                </div>

                <p><strong>What we do NOT use cookies for:</strong></p>
                <ul>
                  <li>Advertising or tracking across other websites</li>
                  <li>Selling your data to third parties</li>
                  <li>Any analytics beyond basic Supabase database logs</li>
                </ul>

                <p><strong>Third-party cookies:</strong> Supabase (our database) and Vercel (our hosting) may set their own technical cookies for security and performance. These are governed by their own privacy policies.</p>

                <p>
                  <strong>How to clear cookies:</strong> Go to your browser settings → Privacy &amp; Security → Clear browsing data → check "Cookies and site data" and "Cached images and files". Note: clearing cookies will sign you out of the Platform.
                </p>
              </div></div>
            </div>

            {/* 7. Privacy */}
            <div className={`tos-section ${activeSection==="privacy"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("privacy")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-lock"/></div>
                  <span className="tos-section-title">7. Privacy &amp; Data</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>We take your privacy seriously and comply with the <strong>EU General Data Protection Regulation (GDPR)</strong>.</p>
                <ul>
                  <li>We only collect data necessary to operate the Platform</li>
                  <li>Your data is stored securely on EU-based servers via Supabase</li>
                  <li>Your Student ID is never displayed to other users — it is used only for verification</li>
                  <li>You may request deletion of your data at any time</li>
                </ul>
                <p>For full details, see our <Link to="/privacy">Privacy Policy</Link>.</p>
              </div></div>
            </div>

            {/* 8. Liability */}
            <div className={`tos-section ${activeSection==="liability"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("liability")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-exclamation-triangle"/></div>
                  <span className="tos-section-title">8. Liability</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>The Platform is provided <strong>"as is"</strong> without any warranties. We do not guarantee:</p>
                <ul>
                  <li>Continuous, uninterrupted access to the Platform</li>
                  <li>The accuracy of any item listings posted by users</li>
                  <li>The quality, safety, or legality of items exchanged</li>
                </ul>
                <p>Free Stuff Niels Brock is a student-run community project. We accept no liability for losses arising from use of the Platform, disputes between users, or transactions that go wrong.</p>
              </div></div>
            </div>

            {/* 9. Termination */}
            <div className={`tos-section ${activeSection==="termination"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("termination")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-x-circle"/></div>
                  <span className="tos-section-title">9. Termination</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>We may suspend or terminate your account at any time, with or without notice, if we believe you have violated these terms.</p>
                <p>You may also delete your own account at any time from your Profile page. Upon deletion, your data will be permanently removed within 30 days.</p>
              </div></div>
            </div>

            {/* 10. Changes */}
            <div className={`tos-section ${activeSection==="changes"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("changes")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-arrow-repeat"/></div>
                  <span className="tos-section-title">10. Changes to Terms</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>We may update these Terms &amp; Conditions at any time. We will notify users of material changes by updating the "Last Updated" date at the top of this page.</p>
                <p>Your continued use of the Platform after changes are posted constitutes your acceptance of the new terms.</p>
              </div></div>
            </div>

            {/* 11. Governing Law */}
            <div className={`tos-section ${activeSection==="governing"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("governing")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-globe-europe-africa"/></div>
                  <span className="tos-section-title">11. Governing Law</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>These Terms &amp; Conditions are governed by the laws of <strong>Denmark</strong>. Any disputes shall be subject to the exclusive jurisdiction of the courts of Copenhagen, Denmark.</p>
                <p>We comply with the <strong>EU General Data Protection Regulation (GDPR)</strong> and the Danish Data Protection Act (Databeskyttelsesloven).</p>
                <p>If you believe we have breached GDPR, you may file a complaint with the Danish Data Protection Authority: <a href="https://www.datatilsynet.dk" target="_blank" rel="noopener noreferrer">datatilsynet.dk</a></p>
              </div></div>
            </div>

            {/* 12. Contact */}
            <div className={`tos-section ${activeSection==="contact"?"open":""}`}>
              <div className="tos-section-header" onClick={()=>toggle("contact")}>
                <div className="tos-section-left">
                  <div className="tos-section-icon"><i className="bi bi-envelope"/></div>
                  <span className="tos-section-title">12. Contact Us</span>
                </div>
                <i className="bi bi-chevron-down tos-chevron"/>
              </div>
              <div className="tos-section-body"><div className="tos-section-content">
                <p>If you have questions about these Terms, please reach out:</p>
                <ul>
                  <li><strong>Email:</strong> <a href="mailto:freestuffnbcbc@gmail.com">freestuffnbcbc@gmail.com</a></li>
                  <li><strong>Phone:</strong> +45 91682540</li>
                  <li><strong>Address:</strong> Niels Brock, Copenhagen, Denmark</li>
                </ul>
              </div></div>
            </div>

            {/* Agree CTA */}
            <div className="agree-card">
              <h3>Ready to get started?</h3>
              <p>By signing in you agree to all of the above. Thanks for being part of the Niels Brock community!</p>
              <Link to="/login" className="agree-btn">
                <i className="bi bi-arrow-right-circle"/> Go to Sign In
              </Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default TermsOfService;