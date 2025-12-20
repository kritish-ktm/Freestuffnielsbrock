import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) {
        setError("Please enter email and password");
        setLoading(false);
        return;
      }

      // Sign in with email/password
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.user_metadata?.is_admin) {
        // Store admin session
        localStorage.setItem("admin_token", data.session.access_token);
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError("You don't have admin access");
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" 
      style={{ background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)" }}>
      <div className="card shadow-lg border-0 rounded-lg" style={{ maxWidth: "420px", width: "100%" }}>
        <div className="card-body p-5 text-center">
          <h1 className="h3 fw-bold mb-2" style={{ color: "#003087" }}>
            <i className="bi bi-shield-lock me-2"></i>
            Admin Login
          </h1>
          <p className="text-muted mb-4">
            Secure access to Free Stuff Niels Brock administration
          </p>

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

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="email" className="form-label fw-bold text-start">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-control form-control-lg"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-bold text-start">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="form-control form-control-lg"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 fw-bold"
              disabled={loading}
              style={{ backgroundColor: "#003087", border: "none" }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="bi bi-door-open me-2"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <hr className="my-4" />

          <div className="alert alert-info small">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Admin Access Only</strong><br />
            Unauthorized access attempts are logged and monitored.
          </div>

          <a href="/" className="btn btn-link text-decoration-none">
            <i className="bi bi-arrow-left me-2"></i>Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;