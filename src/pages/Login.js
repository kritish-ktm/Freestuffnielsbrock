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
        background: "linear-gradient(135deg, #003087 0%, #00A9E0 50%, #D4AF37 100%)",
      }}
    >
      {/* Animated Background Shapes */}
      <div className="position-absolute w-100 h-100" style={{ zIndex: 0 }}>
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background: "rgba(255, 255, 255, 0.1)",
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
            background: "rgba(255, 255, 255, 0.1)",
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
            background: "rgba(255, 255, 255, 0.1)",
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
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.95)"
        }}
      >
        <div className="card-body p-5 text-center">

          {/* Animated Logo Container */}
          <div 
            className="mb-4 mx-auto d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
              animation: "pulse 2s ease-in-out infinite"
            }}
          >
            <img
              src="/logo192.png"
              alt="Free Stuff Niels Brock"
              height="80"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* Title with Animation */}
          <h1 
            className="h2 fw-bold mb-2"
            style={{ 
              background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
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

          {/* Google Button with Hover Effect */}
          <button
            onClick={handleLogin}
            className="btn btn-lg w-100 d-flex align-items-center justify-content-center gap-3 shadow-lg mb-4 google-btn"
            style={{ 
              fontWeight: "600",
              padding: "15px",
              background: "linear-gradient(135deg, #EA4335 0%, #FBBC05 50%, #34A853 100%)",
              border: "none",
              color: "white",
              borderRadius: "12px",
              transition: "all 0.3s ease"
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                Signing in...
              </>
            ) : (
              <>
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  width="24"
                  height="24"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
                Sign in with Google
              </>
            )}
          </button>

          {/* Features Section */}
          <div className="mt-4 p-3 rounded-3" style={{ background: "rgba(0, 48, 135, 0.05)" }}>
            <div className="row g-3 text-start">
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-shield-check text-success" style={{ fontSize: "1.5rem" }}></i>
                  <small className="fw-semibold">Secure</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-lightning-charge text-warning" style={{ fontSize: "1.5rem" }}></i>
                  <small className="fw-semibold">Fast</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-people text-primary" style={{ fontSize: "1.5rem" }}></i>
                  <small className="fw-semibold">Community</small>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-cash-coin text-success" style={{ fontSize: "1.5rem" }}></i>
                  <small className="fw-semibold">Free</small>
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

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(0, 169, 224, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(0, 169, 224, 0);
          }
        }

        .google-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3) !important;
        }

        .google-btn:active {
          transform: translateY(-1px) scale(0.98);
        }
      `}</style>
    </div>
  );
}

export default Login;
