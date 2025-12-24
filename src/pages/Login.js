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
    // Only redirect if we're not in loading state and user exists
    if (!authLoading && user) {
      const fullName = user.user_metadata?.full_name;
      const section = user.user_metadata?.section;

      if (fullName && section) {
        // Profile complete, go home
        navigate("/", { replace: true });
      } else {
        // New user, go to onboarding
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");

      // Sign in with Google
      await signInWithGoogle();
    } catch (loginError) {
      console.error("Login failed:", loginError);
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  // Show loading ONLY if authLoading is true
  if (authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Only show login page if no user
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient-primary">
      <div className="card shadow-lg border-0 rounded-lg" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-body p-5 text-center">

          {/* Custom Logo */}
          <img
            src="/logo192.png"
            alt="Free Stuff Niels Brock"
            className="mb-4"
            height="100"
            style={{ objectFit: "contain" }}
          />

          {/* Title */}
          <h1 className="h3 fw-bold text-primary mb-2">
            Free Stuff Niels Brock
          </h1>
          <p className="text-muted mb-4">
            Login with your student Google account
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
            className="btn btn-lg btn-danger w-100 d-flex align-items-center justify-content-center gap-3 shadow-sm"
            style={{ fontWeight: "500" }}
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
                  width="22"
                  height="22"
                />
                Sign in with Google
              </>
            )}
          </button>

          {/* Footer Text */}
          <p className="mt-4 text-muted small">
            Only for Niels Brock students • Free & secure
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
