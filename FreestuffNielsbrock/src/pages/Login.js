// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const { signInWithEmail, signInWithMagicLink, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginMethod, setLoginMethod] = useState("magiclink");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const pts = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.18 + 0.05,
    }));
    setParticles(pts);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const fullName = user.user_metadata?.full_name;
      const section = user.user_metadata?.section;
      if (fullName && section) navigate("/", { replace: true });
      else navigate("/onboarding", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter both email and password"); return; }
    if (!agreedToTerms) { setError("Please agree to the Terms & Conditions to continue"); return; }
    try {
      setLoading(true); setError("");
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email"); return; }
    if (!email.toLowerCase().endsWith("@edu.nielsbrock.dk")) {
      setError("Please use your Niels Brock student email (@edu.nielsbrock.dk)"); return;
    }
    if (!agreedToTerms) { setError("Please agree to the Terms & Conditions to continue"); return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      await signInWithMagicLink(email);
      setSuccess("Magic link sent! Check your email inbox (and spam folder).");
      setEmail("");
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to send magic link. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (user) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .login-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
          background: #04091a;
          font-family: 'DM Sans', sans-serif;
        }

        .mesh-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 20%, rgba(0,48,135,0.5) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(0,95,163,0.35) 0%, transparent 55%),
            radial-gradient(ellipse 50% 70% at 60% 10%, rgba(127,216,86,0.08) 0%, transparent 50%),
            #04091a;
          animation: meshShift 12s ease-in-out infinite alternate;
        }
        @keyframes meshShift {
          0%   { filter: hue-rotate(0deg) brightness(1); }
          50%  { filter: hue-rotate(8deg) brightness(1.06); }
          100% { filter: hue-rotate(-5deg) brightness(0.97); }
        }

        .grid-overlay {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridDrift 20s linear infinite;
        }
        @keyframes gridDrift { 0%{transform:translateY(0)} 100%{transform:translateY(50px)} }

        .orb { position:absolute; border-radius:50%; filter:blur(50px); pointer-events:none; }
        .orb-1 { width:400px; height:400px; background:radial-gradient(circle, rgba(0,95,163,0.3), transparent 70%); top:-100px; left:-100px; animation:orbFloat1 10s ease-in-out infinite; }
        .orb-2 { width:300px; height:300px; background:radial-gradient(circle, rgba(127,216,86,0.12), transparent 70%); bottom:-80px; right:-80px; animation:orbFloat2 13s ease-in-out infinite; }
        .orb-3 { width:220px; height:220px; background:radial-gradient(circle, rgba(0,160,255,0.15), transparent 70%); top:50%; right:8%; animation:orbFloat3 8s ease-in-out infinite; }
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,40px) scale(1.1)} 66%{transform:translate(20px,-30px) scale(0.95)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-40px,-60px) scale(1.15)} }
        @keyframes orbFloat3 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-40px)} }

        .particle { position:absolute; border-radius:50%; background:rgba(255,255,255,0.5); pointer-events:none; animation:particleRise var(--dur) ease-in-out var(--delay) infinite; }
        @keyframes particleRise { 0%{transform:translateY(0) scale(1);opacity:var(--op)} 50%{transform:translateY(-30px) scale(1.2);opacity:calc(var(--op)*1.5)} 100%{transform:translateY(0) scale(1);opacity:var(--op)} }

        .login-card {
          position:relative; z-index:10;
          width:90%; max-width:460px;
          background:rgba(255,255,255,0.04);
          backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:24px; padding:2.5rem;
          box-shadow:0 0 0 1px rgba(0,95,163,0.2),0 40px 80px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.1);
          animation:cardEntry 0.8s cubic-bezier(0.16,1,0.3,1) forwards;
          opacity:0; transform:translateY(30px);
        }
        @keyframes cardEntry { to{opacity:1;transform:translateY(0)} }

        /* ── Logo: blue + green glow, actual logo image, white bg so it's visible ── */
        .logo-wrap {
          display:flex; align-items:center; justify-content:center;
          margin: 0 auto 1.5rem;
          width:116px; height:116px;
          border-radius:50%;
          position:relative;
          animation:fadeUp 0.6s 0.1s ease both;
        }
        /* Spinning conic ring */
        .logo-spin-ring {
          position:absolute; inset:-3px; border-radius:50%;
          background:conic-gradient(from 0deg, #003087, #00a9e0, #7FD856, #3ddc6e, #00a9e0, #003087);
          animation:logoSpin 3s linear infinite;
          z-index:0;
        }
        /* White background circle so dark logo is visible */
        .logo-bg {
          position:absolute; inset:3px; border-radius:50%;
          background:#ffffff;
          z-index:1;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.08);
        }
        /* Outer glow - green */
        .logo-glow {
          position:absolute; inset:-18px; border-radius:50%;
          background:radial-gradient(circle, rgba(127,216,86,0.3) 0%, rgba(0,48,135,0.25) 45%, transparent 70%);
          animation:glowPulse 2.5s ease-in-out infinite;
          z-index:0;
        }
        /* Inner glow - blue */
        .logo-glow-2 {
          position:absolute; inset:-8px; border-radius:50%;
          background:radial-gradient(circle, rgba(0,169,224,0.2) 0%, transparent 65%);
          animation:glowPulse 2.5s 1.25s ease-in-out infinite;
          z-index:0;
        }
        .logo-img {
          position:relative; z-index:2;
          width:82px; height:82px;
          object-fit:contain;
          border-radius:50%;
        }
        @keyframes logoSpin { to{transform:rotate(360deg)} }
        @keyframes glowPulse {
          0%,100%{opacity:0.7;transform:scale(1)}
          50%{opacity:1;transform:scale(1.1)}
        }

        .login-title { font-family:'Sora',sans-serif; font-weight:800; font-size:1.9rem; color:#fff; text-align:center; margin-bottom:0.35rem; letter-spacing:-0.5px; animation:fadeUp 0.6s 0.25s ease both; }
        .login-sub { text-align:center; color:rgba(255,255,255,0.45); font-size:0.92rem; margin-bottom:1.8rem; animation:fadeUp 0.6s 0.35s ease both; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .alert-glass { border-radius:12px; font-size:0.875rem; padding:0.75rem 1rem; animation:fadeUp 0.4s ease both; margin-bottom:1rem; }
        .alert-info-glass  { background:rgba(0,169,224,0.12); color:rgba(180,230,255,0.9); border:1px solid rgba(0,169,224,0.25); }
        .alert-danger-glass  { background:rgba(220,53,69,0.15); color:rgba(255,180,185,0.95); border:1px solid rgba(220,53,69,0.3); }
        .alert-success-glass { background:rgba(127,216,86,0.12); color:rgba(180,255,160,0.95); border:1px solid rgba(127,216,86,0.3); }

        .form-label-white { color:rgba(255,255,255,0.7); font-size:0.85rem; font-weight:500; margin-bottom:0.4rem; display:block; }
        .input-glass {
          background:rgba(255,255,255,0.06) !important;
          border:1px solid rgba(255,255,255,0.12) !important;
          border-radius:12px !important; color:#fff !important;
          font-size:0.95rem !important; padding:0.75rem 1rem !important;
          transition:border-color 0.2s,box-shadow 0.2s,background 0.2s !important;
          width:100%;
        }
        .input-glass::placeholder { color:rgba(255,255,255,0.3) !important; }
        .input-glass:focus { background:rgba(255,255,255,0.09) !important; border-color:rgba(127,216,86,0.5) !important; box-shadow:0 0 0 3px rgba(127,216,86,0.12) !important; outline:none !important; }
        .input-glass:disabled { opacity:0.5 !important; }

        .terms-row {
          display:flex; align-items:flex-start; gap:10px;
          padding:0.875rem 1rem;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:12px; margin-bottom:1rem;
          cursor:pointer; transition:background 0.2s, border-color 0.2s;
        }
        .terms-row:hover { background:rgba(127,216,86,0.06); border-color:rgba(127,216,86,0.25); }
        .terms-checkbox { width:18px; height:18px; min-width:18px; border-radius:5px; accent-color:#7FD856; cursor:pointer; margin-top:2px; }
        .terms-text { color:rgba(255,255,255,0.5); font-size:0.82rem; line-height:1.5; }
        .terms-text a { color:#7FD856; text-decoration:none; font-weight:500; }
        .terms-text a:hover { color:#a8f070; text-decoration:underline; }

        .btn-primary-glow {
          background:linear-gradient(135deg,#003087,#005fa3);
          border:none; border-radius:12px; color:#fff;
          font-family:'Sora',sans-serif; font-weight:600; font-size:0.95rem;
          padding:0.8rem 1.5rem; width:100%; cursor:pointer;
          position:relative; overflow:hidden;
          transition:transform 0.2s,box-shadow 0.2s;
          box-shadow:0 4px 20px rgba(0,48,135,0.4);
        }
        .btn-primary-glow:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 30px rgba(0,48,135,0.55),0 0 20px rgba(127,216,86,0.15); }
        .btn-primary-glow:active:not(:disabled) { transform:translateY(0); }
        .btn-primary-glow:disabled { opacity:0.45; cursor:not-allowed; }
        .btn-primary-glow::after { content:''; position:absolute; top:-50%; left:-80%; width:60%; height:200%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent); transform:skewX(-20deg); animation:shimmer 3s ease-in-out infinite; }
        @keyframes shimmer { 0%{left:-80%} 60%,100%{left:120%} }

        .btn-outline-glass { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.18); border-radius:12px; color:rgba(255,255,255,0.8); font-family:'Sora',sans-serif; font-weight:500; font-size:0.92rem; padding:0.75rem 1.5rem; width:100%; cursor:pointer; transition:background 0.2s,border-color 0.2s,transform 0.2s; }
        .btn-outline-glass:hover { background:rgba(255,255,255,0.1); border-color:rgba(255,255,255,0.3); transform:translateY(-1px); }

        .back-link { background:none; border:none; color:rgba(255,255,255,0.5); font-size:0.875rem; cursor:pointer; padding:0; margin-bottom:1.25rem; display:flex; align-items:center; gap:6px; transition:color 0.2s; }
        .back-link:hover { color:rgba(255,255,255,0.9); }

        .divider { display:flex; align-items:center; gap:1rem; margin:1.25rem 0; color:rgba(255,255,255,0.25); font-size:0.8rem; }
        .divider::before,.divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.1); }

        .footer-badge { margin-top:1.5rem; padding:0.6rem 1rem; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; text-align:center; color:rgba(255,255,255,0.35); font-size:0.8rem; }
        .help-text { color:rgba(255,255,255,0.28); font-size:0.78rem; margin-top:0.35rem; }
        .signup-link { text-align:center; margin-top:1.25rem; color:rgba(255,255,255,0.35); font-size:0.85rem; }
        .signup-link a { color:#7FD856; font-weight:600; text-decoration:none; }
        .signup-link a:hover { color:#a8f070; }

        .field-row { animation:fadeUp 0.5s ease both; }
        .field-row:nth-child(1){animation-delay:0.1s} .field-row:nth-child(2){animation-delay:0.2s} .field-row:nth-child(3){animation-delay:0.3s}
        @media(max-width:480px){ .login-card{padding:2rem 1.5rem} .login-title{font-size:1.6rem} }
      `}</style>

      <div className="login-root">
        <div className="mesh-bg" />
        <div className="grid-overlay" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        {particles.map((p) => (
          <div key={p.id} className="particle" style={{ left:`${p.x}%`, top:`${p.y}%`, width:`${p.size}px`, height:`${p.size}px`, "--dur":`${p.duration}s`, "--delay":`${p.delay}s`, "--op":p.opacity }} />
        ))}

        <div className="login-card">

          {/* Logo — white bg so logo is visible on dark, with blue+green glow ring */}
          <div className="logo-wrap">
            <div className="logo-glow" />
            <div className="logo-glow-2" />
            <div className="logo-spin-ring" />
            <div className="logo-bg" />
            <img src="/freestuffnielsbrocklogo.png?v=2" alt="Free Stuff Niels Brock" className="logo-img" />
          </div>

          <h1 className="login-title">Welcome Back</h1>
          <p className="login-sub">Sign in to Free Stuff Niels Brock</p>

          {error && <div className="alert-glass alert-danger-glass"><i className="bi bi-exclamation-circle me-2"/>{error}</div>}
          {success && <div className="alert-glass alert-success-glass"><i className="bi bi-envelope-check me-2"/>{success}</div>}

          {loginMethod === "magiclink" && (
            <>
              <div className="alert-glass alert-info-glass">
                <i className="bi bi-magic me-2"/>
                <strong>Passwordless sign-in:</strong> We'll send you a secure link — no password needed!
              </div>

              <form onSubmit={handleMagicLink}>
                <div className="mb-3 field-row">
                  <label className="form-label-white">Niels Brock Student Email</label>
                  <input type="email" className="input-glass" placeholder="yourname@edu.nielsbrock.dk" value={email} onChange={(e)=>setEmail(e.target.value)} required disabled={loading}/>
                  <p className="help-text"><i className="bi bi-info-circle me-1"/>Must end with @edu.nielsbrock.dk</p>
                </div>

                <div className="terms-row field-row" onClick={()=>setAgreedToTerms(!agreedToTerms)}>
                  <input type="checkbox" className="terms-checkbox" checked={agreedToTerms} onChange={(e)=>setAgreedToTerms(e.target.checked)} onClick={(e)=>e.stopPropagation()}/>
                  <span className="terms-text">
                    I agree to the{" "}<Link to="/terms" onClick={(e)=>e.stopPropagation()}>Terms &amp; Conditions</Link>{" "}and{" "}<Link to="/privacy" onClick={(e)=>e.stopPropagation()}>Privacy Policy</Link>. I confirm I am a Niels Brock student and consent to cookie usage.
                  </span>
                </div>

                <div className="field-row">
                  <button type="submit" className="btn-primary-glow" disabled={loading||!agreedToTerms}>
                    {loading?<><span className="spinner-border spinner-border-sm me-2"/>Sending...</>:<><i className="bi bi-send me-2"/>Send Magic Link</>}
                  </button>
                </div>
              </form>

              <div className="divider">OR</div>
              <button className="btn-outline-glass" onClick={()=>setLoginMethod("email")}><i className="bi bi-envelope me-2"/>Sign in with Email &amp; Password</button>
              <p className="signup-link">Don't have an account? <Link to="/signup">Sign up</Link></p>
            </>
          )}

          {loginMethod === "email" && (
            <>
              <button className="back-link" onClick={()=>{setLoginMethod("magiclink");setError("");setSuccess("");}}>
                <i className="bi bi-arrow-left"/> Back to Magic Link
              </button>
              <form onSubmit={handleEmailLogin}>
                <div className="mb-3 field-row">
                  <label className="form-label-white">Email</label>
                  <input type="email" className="input-glass" placeholder="yourname@edu.nielsbrock.dk" value={email} onChange={(e)=>setEmail(e.target.value)} required disabled={loading}/>
                </div>
                <div className="mb-3 field-row">
                  <label className="form-label-white">Password</label>
                  <input type="password" className="input-glass" placeholder="Enter your password" value={password} onChange={(e)=>setPassword(e.target.value)} required disabled={loading}/>
                </div>
                <div className="terms-row field-row" onClick={()=>setAgreedToTerms(!agreedToTerms)}>
                  <input type="checkbox" className="terms-checkbox" checked={agreedToTerms} onChange={(e)=>setAgreedToTerms(e.target.checked)} onClick={(e)=>e.stopPropagation()}/>
                  <span className="terms-text">
                    I agree to the{" "}<Link to="/terms" onClick={(e)=>e.stopPropagation()}>Terms &amp; Conditions</Link>{" "}and{" "}<Link to="/privacy" onClick={(e)=>e.stopPropagation()}>Privacy Policy</Link>.
                  </span>
                </div>
                <div className="field-row">
                  <button type="submit" className="btn-primary-glow" disabled={loading||!agreedToTerms}>
                    {loading?<><span className="spinner-border spinner-border-sm me-2"/>Signing in...</>:"Sign In"}
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="footer-badge">
            <i className="bi bi-shield-check me-2" style={{color:"#7FD856"}}/>
            <strong style={{color:"rgba(255,255,255,0.5)"}}>Secure &amp; Easy</strong>
            <span> · Only for Niels Brock students</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;