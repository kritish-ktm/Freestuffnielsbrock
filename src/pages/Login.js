// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const { signInWithGoogle, signInWithEmail, signInWithMagicLink, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginMethod, setLoginMethod] = useState("buttons"); // "buttons", "email", "magiclink"
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // If user is already logged in, redirect
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

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (loginError) {
      console.error("Login failed:", loginError);
      setError("Google login failed. Please try again.");
      setLoading(false);
    }
  };

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
      // Will redirect via useEffect
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

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await signInWithMagicLink(email);
      setSuccess("✅ Magic link sent! Check your email inbox.");
      setLoading(false);
    } catch (loginError) {
      console.error("Magic link failed:", loginError);
      setError("Failed to send magic link. Please try again.");
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
              {success}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setSuccess("")}
              ></button>
            </div>
          )}

          {/* Login Method Selection */}
          {loginMethod === "buttons" && (
            <>
              {/* Google Button */}
              <button
                onClick={handleGoogleLogin}
                className="btn btn-lg w-100 d-flex align-items-center justify-content-center gap-3 shadow-sm mb-3 google-btn"
                style={{ 
                  fontWeight: "600",
                  padding: "15px",
                  background: "white",
                  border: "2px solid #e0e0e0",
                  color: "#333",
                  borderRadius: "12px",
                  transition: "all 0.3s ease"
                }}
                disabled={loading}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  width="24"
                  height="24"
                />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" />
                <span className="px-3 text-muted small">OR</span>
                <hr className="flex-grow-1" />
              </div>

              {/* Email/Password Button */}
              <button
                onClick={() => setLoginMethod("email")}
                className="btn btn-outline-primary btn-lg w-100 mb-2"
                style={{ borderRadius: "12px", fontWeight: "600" }}
              >
                <i className="bi bi-envelope me-2"></i>
                Sign in with Email
              </button>

              {/* Magic Link Button */}
              <button
                onClick={() => setLoginMethod("magiclink")}
                className="btn btn-outline-secondary btn-lg w-100"
                style={{ borderRadius: "12px", fontWeight: "600" }}
              >
                <i className="bi bi-magic me-2"></i>
                Sign in with Magic Link
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
                onClick={() => setLoginMethod("buttons")}
                className="btn btn-link text-decoration-none mb-3 p-0"
                style={{ color: "#003087" }}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to options
              </button>

              <form onSubmit={handleEmailLogin}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="your@email.com"
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

          {/* Magic Link Form */}
          {loginMethod === "magiclink" && (
            <>
              <button
                onClick={() => setLoginMethod("buttons")}
                className="btn btn-link text-decoration-none mb-3 p-0"
                style={{ color: "#003087" }}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Back to options
              </button>

              <div className="alert alert-info" role="alert">
                <small>
                  <i className="bi bi-info-circle me-2"></i>
                  We'll send you a magic link to sign in without a password!
                </small>
              </div>

              <form onSubmit={handleMagicLink}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
            </>
          )}

          {/* Footer */}
          <p className="mt-4 mb-0 text-muted small text-center">
            <i className="bi bi-mortarboard-fill me-2" style={{ color: "#003087" }}></i>
            Only for Niels Brock students
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
          border-color: #003087;
        }

        .google-btn:active {
          transform: translateY(0px);
        }
      `}</style>
    </div>
  );
}

export default Login;
