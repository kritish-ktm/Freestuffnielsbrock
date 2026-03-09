// src/pages/Login.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const { signInWithEmail, signInWithMagicLink, signInWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginMethod, setLoginMethod] = useState("magiclink");
  const [magicLinkSent, setMagicLinkSent] = useState(false); // ← triggers Google button reveal

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      const fullName = user.user_metadata?.full_name;
      const section = user.user_metadata?.section;
      if (fullName && section) {
        navigate("/", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  // Canvas particle animation (matches Header.js)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    const NUM_DOTS = 55;
    const dots = [];

    for (let i = 0; i < NUM_DOTS; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.6,
        jaggedness: 0.5 + Math.random() * 0.5,
      });
    }

    function drawDot(dot) {
      ctx.beginPath();
      const spikes = 6 + Math.floor(Math.random() * 3);
      const step = (Math.PI * 2) / spikes;
      for (let i = 0; i < spikes; i++) {
        const r = dot.radius + (Math.random() * dot.jaggedness - dot.jaggedness / 2);
        const x = dot.x + r * Math.cos(i * step);
        const y = dot.y + r * Math.sin(i * step);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fill();
    }

    let animId;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      dots.forEach((dot) => {
        drawDot(dot);
        dot.x += Math.cos(dot.angle) * dot.speed;
        dot.y += Math.sin(dot.angle) * dot.speed;
        dot.angle += (Math.random() - 0.5) * 0.1;
        if (dot.x > width + dot.radius) dot.x = -dot.radius;
        if (dot.x < -dot.radius) dot.x = width + dot.radius;
        if (dot.y > height + dot.radius) dot.y = -dot.radius;
        if (dot.y < -dot.radius) dot.y = height + dot.radius;
      });
      animId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email");
    if (!email.toLowerCase().endsWith("@edu.nielsbrock.dk")) {
      return setError("Please use your Niels Brock student email (@edu.nielsbrock.dk)");
    }
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await signInWithMagicLink(email);
      setSuccess("✅ Magic link sent! Check your inbox (and spam folder).");
      setMagicLinkSent(true); // ← reveal Google button
      setEmail("");
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to send magic link. Please try again.");
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError("Please enter both email and password");
    try {
      setLoading(true);
      setError("");
      await signInWithEmail(email, password);
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || "Google login failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden">
      {/* Animated particle canvas background */}
      <canvas ref={canvasRef} className="login-canvas" />

      {/* Floating item icons (same style as Header) */}
      <div className="login-floating-icons">
        {["bi-phone", "bi-book", "bi-laptop", "bi-bag", "bi-earbuds", "bi-joystick", "bi-cup", "bi-watch"].map(
          (icon, i) => (
            <div key={i} className={`login-float-icon icon-${i}`}>
              <i className={`bi ${icon}`}></i>
            </div>
          )
        )}
      </div>

      {/* Login card */}
      <div className="login-card-wrapper position-relative" style={{ zIndex: 10, width: "100%", maxWidth: "460px", padding: "1rem" }}>
        <div
          className="card border-0 shadow-lg"
          style={{ borderRadius: "20px", overflow: "hidden" }}
        >
          {/* Card header strip */}
          <div
            style={{
              background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
              padding: "28px 32px 20px",
              textAlign: "center",
            }}
          >
            <img
              src="/freestuffnielsbrocklogo.png"
              alt="Free Stuff Niels Brock"
              className="mb-2"
              style={{ height: 72, width: 72, objectFit: "contain", borderRadius: "50%", background: "rgba(255,255,255,0.15)", padding: "4px" }}
            />
            <h2 className="fw-bold text-white mb-1" style={{ fontSize: "1.5rem" }}>
              Free Stuff NB
            </h2>
            <p className="text-white mb-0" style={{ opacity: 0.85, fontSize: "0.9rem" }}>
              Sign in to give & get free items
            </p>
          </div>

          <div className="card-body p-4">
            {/* Alerts */}
            {error && (
              <div className="alert alert-danger alert-dismissible fade show py-2" role="alert">
                <i className="bi bi-exclamation-circle me-2"></i>
                <small>{error}</small>
                <button type="button" className="btn-close btn-close-sm" onClick={() => setError("")}></button>
              </div>
            )}
            {success && (
              <div className="alert alert-success py-2" role="alert">
                <i className="bi bi-check-circle me-2"></i>
                <small>{success}</small>
              </div>
            )}

            {/* ── MAGIC LINK VIEW ── */}
            {loginMethod === "magiclink" && (
              <>
                {/* Google button — always visible at top */}
                <button
                  onClick={handleGoogleLogin}
                  className="btn btn-white w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                  style={{
                    borderRadius: "12px",
                    fontWeight: "600",
                    border: "1.5px solid #dadce0",
                    background: "#fff",
                    color: "#3c4043",
                    fontSize: "0.95rem",
                    padding: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  }}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="d-flex align-items-center mb-3">
                  <hr className="flex-grow-1 m-0" />
                  <span className="px-3 text-muted small">or use student email</span>
                  <hr className="flex-grow-1 m-0" />
                </div>

                {/* Magic link hint */}
                <div
                  className="rounded-3 px-3 py-2 mb-3 d-flex align-items-start gap-2"
                  style={{ background: "#eef4ff", border: "1px solid #c7d9ff" }}
                >
                  <i className="bi bi-magic mt-1" style={{ color: "#003087", fontSize: "0.85rem" }}></i>
                  <small style={{ color: "#003087" }}>
                    <strong>Passwordless:</strong> We'll email you a secure sign-in link — no password needed.
                  </small>
                </div>

                <form onSubmit={handleMagicLink}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Niels Brock Student Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="yourname@edu.nielsbrock.dk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      style={{ borderRadius: "12px" }}
                    />
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>Must end with @edu.nielsbrock.dk
                    </small>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-2"
                    style={{ borderRadius: "12px", fontWeight: "600", background: "#003087", border: "none" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Sending...</>
                    ) : (
                      <><i className="bi bi-send me-2"></i>Send Magic Link</>
                    )}
                  </button>
                </form>

                {/* ── After magic link is sent → nudge user to try Google ── */}
                {magicLinkSent && (
                  <div
                    className="mt-3 p-3 rounded-3 text-center"
                    style={{
                      background: "linear-gradient(135deg, #f0f7ff 0%, #e8f5e9 100%)",
                      border: "1.5px dashed #00A9E0",
                      animation: "fadeSlideIn 0.4s ease-out",
                    }}
                  >
                    <p className="mb-2 small fw-semibold" style={{ color: "#003087" }}>
                      <i className="bi bi-envelope-check me-1"></i> Magic link sent! Not received yet?
                    </p>
                    <p className="mb-2 text-muted" style={{ fontSize: "0.8rem" }}>
                      Check spam, or sign in instantly with Google:
                    </p>
                    <button
                      onClick={handleGoogleLogin}
                      className="btn btn-sm d-inline-flex align-items-center gap-2"
                      style={{
                        borderRadius: "10px",
                        fontWeight: "600",
                        border: "1.5px solid #dadce0",
                        background: "#fff",
                        color: "#3c4043",
                        padding: "6px 16px",
                      }}
                      disabled={googleLoading}
                    >
                      {googleLoading ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                      )}
                      Continue with Google instead
                    </button>
                  </div>
                )}

                {/* Divider to email/password */}
                <div className="d-flex align-items-center my-3">
                  <hr className="flex-grow-1 m-0" />
                  <span className="px-3 text-muted small">OR</span>
                  <hr className="flex-grow-1 m-0" />
                </div>

                <button
                  onClick={() => { setLoginMethod("email"); setError(""); setSuccess(""); }}
                  className="btn btn-outline-secondary w-100"
                  style={{ borderRadius: "12px", fontWeight: "600" }}
                >
                  <i className="bi bi-envelope me-2"></i>Sign in with Email & Password
                </button>

                <p className="text-center mt-3 mb-0">
                  <small className="text-muted">
                    Don't have an account?{" "}
                    <Link to="/signup" style={{ color: "#003087", fontWeight: "600" }}>Sign up</Link>
                  </small>
                </p>
              </>
            )}

            {/* ── EMAIL / PASSWORD VIEW ── */}
            {loginMethod === "email" && (
              <>
                <button
                  onClick={() => { setLoginMethod("magiclink"); setError(""); setSuccess(""); setMagicLinkSent(false); }}
                  className="btn btn-link text-decoration-none mb-3 p-0"
                  style={{ color: "#003087" }}
                >
                  <i className="bi bi-arrow-left me-2"></i>Back
                </button>

                {/* Google button also available on email/password view */}
                <button
                  onClick={handleGoogleLogin}
                  className="btn btn-white w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                  style={{
                    borderRadius: "12px",
                    fontWeight: "600",
                    border: "1.5px solid #dadce0",
                    background: "#fff",
                    color: "#3c4043",
                    fontSize: "0.95rem",
                    padding: "10px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  }}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="d-flex align-items-center mb-3">
                  <hr className="flex-grow-1 m-0" />
                  <span className="px-3 text-muted small">or student email</span>
                  <hr className="flex-grow-1 m-0" />
                </div>

                <form onSubmit={handleEmailLogin}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="yourname@edu.nielsbrock.dk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      style={{ borderRadius: "12px" }}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-semibold small">Password</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{ borderRadius: "12px" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    style={{ borderRadius: "12px", fontWeight: "600", background: "#003087", border: "none" }}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Signing in...</>
                    ) : "Sign In"}
                  </button>
                </form>

                <p className="text-center mt-3 mb-0">
                  <small className="text-muted">
                    Don't have an account?{" "}
                    <Link to="/signup" style={{ color: "#003087", fontWeight: "600" }}>Sign up</Link>
                  </small>
                </p>
              </>
            )}
          </div>

          {/* Card footer */}
          <div
            className="text-center py-3 px-4"
            style={{ background: "#f8f9fa", borderTop: "1px solid #eee" }}
          >
            <small className="text-muted">
              <i className="bi bi-mortarboard-fill me-1" style={{ color: "#003087" }}></i>
              Free Stuff Niels Brock — student community platform
            </small>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          background: linear-gradient(135deg, #667788 0%, #0b0f3b 100%);
        }

        .login-canvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .login-floating-icons {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .login-float-icon {
          position: absolute;
          font-size: 3.5rem;
          color: rgba(255,255,255,0.12);
          animation: gentle-sway 5s ease-in-out infinite;
        }

        .icon-0 { top: 8%;  left: 4%; }
        .icon-1 { top: 20%; right: 6%; }
        .icon-2 { top: 55%; left: 3%; }
        .icon-3 { top: 70%; right: 5%; }
        .icon-4 { top: 35%; left: 88%; }
        .icon-5 { top: 80%; left: 15%; }
        .icon-6 { top: 10%; left: 50%; }
        .icon-7 { top: 60%; left: 50%; }

        @keyframes gentle-sway {
          0%, 100% { transform: rotateZ(-4deg); }
          50% { transform: rotateZ(4deg); }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 576px) {
          .login-float-icon { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}

export default Login;