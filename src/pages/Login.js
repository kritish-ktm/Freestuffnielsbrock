// src/pages/Login.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { signInWithGoogle, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (loginError) {
      console.error("Login failed:", loginError);
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  // Don't show anything while checking auth - just a simple check
  if (authLoading) {
    return null; // Return nothing while loading
  }

  // Don't show login form if user exists (will redirect)
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
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: "150px",
            height: "150px",
            background: "rgba(255, 255, 255, 0.05)",
            top: "50%",
            right: "10%",
            animation: "float 7s ease-in-out infinite"
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
        <div className="card-body p-5 text-center">

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
            className="h2 fw-bold mb-2"
            style={{ color: "#003087" }}
          >
            Free Stuff Niels Brock
          </h1>
          <p className="text-muted mb-4">
            🎓 Your campus marketplace for sharing and saving
          </p>

          {/* Error Message */}
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

          {/* Google Button */}
          <button
            onClick={handleLogin}
            className="btn btn-lg w-100 d-flex align-items-center justify-content-center gap-3 shadow-sm mb-4 google-btn"
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
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                <span style={{ color: "#666" }}>Signing in...</span>
              </>
            ) : (
              <>
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  width="24"
                  height="24"
                />
                Sign in with Google
              </>
            )}
          </button>

          {/* Features Section */}
          <div className="mt-4 p-3 rounded-3" style={{ background: "#f8f9fa" }}>
            <div className="row g-3 text-start">
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check" style={{ fontSize: "1.5rem", color: "#28a745" }}></i>
                  <small className="fw-semibold text-muted">Secure</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-lightning-charge" style={{ fontSize: "1.5rem", color: "#ffc107" }}></i>
                  <small className="fw-semibold text-muted">Fast</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-people" style={{ fontSize: "1.5rem", color: "#003087" }}></i>
                  <small className="fw-semibold text-muted">Community</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-cash-coin" style={{ fontSize: "1.5rem", color: "#28a745" }}></i>
                  <small className="fw-semibold text-muted">Free</small>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <p className="mt-4 mb-0 text-muted small">
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
