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
    // Only redirect if auth is loaded AND user exists
    if (!authLoading && user) {
      const fullName = user.user_metadata?.full_name;
      const section = user.user_metadata?.section;

      console.log("User exists in Login, redirecting...");
      
      if (fullName && section) {
        // Profile complete, go home
        navigate("/", { replace: true });
      } else {
        // New user, go to onboarding
        navigate("/onboarding", { replace: true });
      }
    } else if (!authLoading && !user) {
      console.log("No user, staying on login page");
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

  // Show loading ONLY if authLoading is true AND we don't have a definitive answer yet
  // Add a timeout safety mechanism
  const [showLoginForm, setShowLoginForm] = React.useState(false);

  React.useEffect(() => {
    // After 2 seconds, force show the login form if still loading
    const timeout = setTimeout(() => {
      if (authLoading && !user) {
        console.warn("Auth taking too long, forcing login form display");
        setShowLoginForm(true);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [authLoading, user]);

  // Show loading screen only if truly loading and not taking too long
  if (authLoading && !showLoginForm) {
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

  // If user exists, wait for redirect (don't show form)
  if (user && !authLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Redirecting...</p>
        </div>
      </div>
    );
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
