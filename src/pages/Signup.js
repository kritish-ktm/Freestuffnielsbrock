// src/pages/Signup.js
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email.endsWith("@niels-brock.dk") && !formData.email.endsWith("@student.niels-brock.dk")) {
      setError("Please use your Niels Brock student email address");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(formData.email, formData.password, {});
      
      // Show success message
      alert("✅ Account created! Please check your email to verify your account.");
      navigate("/login");
    } catch (signupError) {
      console.error("Signup failed:", signupError);
      setError(signupError.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #1a2332 0%, #2d4563 50%, #3d5a80 100%)",
      }}
    >
      <div 
        className="card shadow-lg border-0 rounded-4"
        style={{ 
          maxWidth: "500px", 
          width: "90%",
          background: "white"
        }}
      >
        <div className="card-body p-5">
          {/* Logo */}
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
            Create Account
          </h1>
          <p className="text-muted mb-4 text-center">
            Join the Niels Brock community
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

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Student Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                name="email"
                className="form-control form-control-lg"
                placeholder="your@niels-brock.dk"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <small className="text-muted">Use your Niels Brock email</small>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                name="password"
                className="form-control form-control-lg"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="form-label fw-semibold">
                Confirm Password <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                className="form-control form-control-lg"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mb-0">
            <small className="text-muted">
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#003087", fontWeight: "600" }}>
                Sign in
              </Link>
            </small>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
