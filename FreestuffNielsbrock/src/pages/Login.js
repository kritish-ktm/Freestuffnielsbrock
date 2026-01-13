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
  const [loginMethod, setLoginMethod] = useState("magiclink"); // Default to magic link
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await signInWithEmail(email, password);
    } catch (loginError) {
      console.error("Login failed:", loginError);
      setError(loginError.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  const handleMagicLink = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email");
      return;
    }

    // Check if it's a Niels Brock email
    if (!email.toLowerCase().endsWith('@edu.nielsbrock.dk')) {
      setError("Please use your Niels Brock student email (@edu.nielsbrock.dk)");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await signInWithMagicLink(email);
      setSuccess("✅ Magic link sent! Check your email inbox (and spam folder).");
      setEmail(""); // Clear email field
      setLoading(false);
    } catch (loginError) {
      console.error("Magic link failed:", loginError);
      setError(loginError.message || "Failed to send magic link. Please try again.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return null;
  }

  if (user) {
    return null;
  }

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a2332 0%, #2d4563 50%, #3d5a80 100%)",
      }}
    >
      {/* Animated Background Shapes */}
      <div className="position-absolute w-100 h-100" style={{ zIndex: 0 }}>
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.05)",
            top: "-100px",
            left: "-100px",
            animation: "float 6s ease-in-out infinite"
          }}
        ></div>
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: "200px",
            height: "200px",
            background: "rgba(255, 255, 255, 0.05)",
            bottom: "-50px",
            right: "-50px",
            animation: "float 8s ease-in-out infinite"
          }}
        ></div>
      </div>

      <div 
        className="card shadow-lg border-0 rounded-4 position-relative"
        style={{ 
          maxWidth: "450px", 
          width: "90%",
          zIndex: 1,
          background: "white"
        }}
      >
        <div className="card-body p-5">

          {/* Logo Container */}
          <div 
            className="mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "100px",
              height: "100px",
              background: "linear-gradient(135deg, #003087 0%, #005fa3 100%)",
              boxShadow: "0 4px 15px rgba(0, 48, 135, 0.2)"
            }}
          >
            <img
              src="/logo192.png"
              alt="Free Stuff Niels Brock"
              height="65"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Title */}
          <h1 
            className="h2 fw-bold mb-2 text-center"
            style={{ color: "#003087" }}
          >
            Welcome Back
          </h1>
          <p className="text-muted mb-4 text-center">
            Sign in to Free Stuff Niels Brock
          </p>

          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setError("")}
              ></button>
            </div>
          )}

          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {success}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccess("")}
              ></button>
            </div>
          )}

          {/* Magic Link Form (Default) */}
          {loginMethod === "magiclink" && (
            <>
              <div className="alert alert-info mb-4" role="alert">
                <small>
                  <i className="bi bi-magic me-2"></i>
                  <strong>Passwordless sign-in:</strong> We'll send you a secure link to sign in without a password!
                </small>
              </div>

              <form onSubmit={handleMagicLink}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    Niels Brock Student Email
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="yourname@edu.nielsbrock.dk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Must end with @edu.nielsbrock.dk
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mb-3"
                  style={{ 
                    borderRadius: "12px", 
                    fontWeight: "600",
                    backgroundColor: "#003087",
                    border: "none"
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Send Magic Link
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" />
                <span className="px-3 text-muted small">OR</span>
                <hr className="flex-grow-1" />
              </div>

              {/* Email/Password Button */}
              <button
                onClick={() => setLoginMethod("email")}
                className="btn btn-outline-secondary btn-lg w-100"
                style={{ borderRadius: "12px", fontWeight: "600" }}
              >
                <i className="bi bi-envelope me-2"></i>
                Sign in with Email & Password
              </button>

              {/* Sign Up Link */}
              <p className="text-center mt-4 mb-0">
                <small className="text-muted">
                  Don't have an account?{" "}
                  <Link to="/signup" style={{ color: "#003087", fontWeight: "600" }}>
                    Sign up
                  </Link>
                </small>
              </p>
            </>
          )}

          {/* Email/Password Form */}
          {loginMethod === "email" && (
            <>
              <button
                onClick={() => {
                  setLoginMethod("magiclink");
                  setError("");
                  setSuccess("");
                }}
                className="btn btn-link text-decoration-none mb-3 p-0"
                style={{ color: "#003087" }}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to Magic Link
              </button>

              <form onSubmit={handleEmailLogin}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="yourname@edu.nielsbrock.dk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  style={{ 
                    borderRadius: "12px", 
                    fontWeight: "600",
                    backgroundColor: "#003087",
                    border: "none"
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </>
          )}

          {/* Footer */}
          <div className="mt-4 p-3 rounded-3 text-center" style={{ background: "#f8f9fa" }}>
            <p className="mb-0 text-muted small">
              <i className="bi bi-shield-check me-2" style={{ color: "#003087" }}></i>
              <strong>Secure & Easy:</strong> No passwords to remember
            </p>
          </div>

          <p className="mt-3 mb-0 text-muted small text-center">
            <i className="bi bi-mortarboard-fill me-2" style={{ color: "#003087" }}></i>
            Only for Niels Brock students
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 48, 135, 0.3) !important;
        }

        .btn-primary:active {
          transform: translateY(0px);
        }

        @media (max-width: 576px) {
          .card-body {
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Login;