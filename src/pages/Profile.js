import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  
  const [formData, setFormData] = useState({
    full_name: "",
    section: "",
    intake_month: "",
    phone_number: "",
    dob: "",
    campus_id: "",
    course: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // Get user metadata from auth
        const fullName = user.user_metadata?.full_name || "";
        const section = user.user_metadata?.section || "";
        const intakeMonth = user.user_metadata?.intake_month || "";

        setFormData({
          full_name: fullName,
          section: section,
          intake_month: intakeMonth,
          phone_number: user.user_metadata?.phone_number || "",
          dob: user.user_metadata?.dob || "",
          campus_id: user.user_metadata?.campus_id || "",
          course: user.user_metadata?.course || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        setMessage("Error loading profile");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      setMessage("⚠️ Please enter your full name");
      setMessageType("danger");
      return;
    }

    if (!formData.section.trim()) {
      setMessage("⚠️ Please select your section");
      setMessageType("danger");
      return;
    }

    if (!formData.intake_month) {
      setMessage("⚠️ Please select your intake month");
      setMessageType("danger");
      return;
    }

    setSaving(true);
    try {
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name.trim(),
          section: formData.section.trim(),
          intake_month: formData.intake_month,
          phone_number: formData.phone_number.trim(),
          dob: formData.dob,
          campus_id: formData.campus_id.trim(),
          course: formData.course.trim(),
        }
      });

      if (error) throw error;

      setMessage("✅ Profile updated successfully!");
      setMessageType("success");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("❌ Error updating profile: " + error.message);
      setMessageType("danger");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="container my-5" style={{ maxWidth: "600px" }}>
      <div className="mb-4">
        <button 
          className="btn btn-link text-decoration-none" 
          onClick={() => navigate(-1)}
          style={{ color: "#003087" }}
        >
          <i className="bi bi-arrow-left me-2"></i>
          Back
        </button>
      </div>

      <div className="card shadow-lg border-0">
        <div className="card-body p-5">
          <h2 className="fw-bold mb-1" style={{ color: "#003087" }}>
            <i className="bi bi-person-circle me-2"></i>
            My Profile
          </h2>
          <p className="text-muted mb-4">Manage your profile information</p>

          {message && (
            <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
              {message}
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setMessage("")}
              ></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email (Read-only) */}
            <div className="mb-4">
              <label className="form-label fw-bold">
                Email Address
              </label>
              <input
                type="email"
                className="form-control"
                value={user?.email || ""}
                disabled
              />
              <small className="text-muted">
                Your email cannot be changed
              </small>
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <label htmlFor="full_name" className="form-label fw-bold">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                className="form-control form-control-lg"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                required
                disabled={saving}
              />
              <small className="text-muted">
                This is how other students will see you
              </small>
            </div>

            {/* Section */}
            <div className="mb-4">
              <label htmlFor="section" className="form-label fw-bold">
                Section <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="section"
                name="section"
                className="form-control form-control-lg"
                value={formData.section}
                onChange={handleChange}
                placeholder="e.g. Section E"
                required
                disabled={saving}
              />
              <small className="text-muted">
                Which section are you in?
              </small>
            </div>

            {/* Intake Month */}
            <div className="mb-4">
              <label htmlFor="intake_month" className="form-label fw-bold">
                Intake Month <span className="text-danger">*</span>
              </label>
              <select
                id="intake_month"
                name="intake_month"
                className="form-select form-select-lg"
                value={formData.intake_month}
                onChange={handleChange}
                required
                disabled={saving}
              >
                <option value="">-- Select Intake Month --</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <small className="text-muted">
                When did you start at Niels Brock?
              </small>
            </div>

            {/* Phone Number */}
            <div className="mb-4">
              <label htmlFor="phone_number" className="form-label fw-bold">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                className="form-control form-control-lg"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="e.g. +45 40 40 40 40"
                required
                disabled={saving}
              />
              <small className="text-muted">For verification purposes</small>
            </div>

            {/* Date of Birth */}
            <div className="mb-4">
              <label htmlFor="dob" className="form-label fw-bold">
                Date of Birth <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                className="form-control form-control-lg"
                value={formData.dob}
                onChange={handleChange}
                required
                disabled={saving}
              />
            </div>

            {/* Campus ID */}
            <div className="mb-4">
              <label htmlFor="campus_id" className="form-label fw-bold">
                Student ID <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="campus_id"
                name="campus_id"
                className="form-control form-control-lg"
                value={formData.campus_id}
                onChange={handleChange}
                placeholder="e.g. NB123456"
                required
                disabled={saving}
              />
            </div>

            {/* Course */}
            <div className="mb-4">
              <label htmlFor="course" className="form-label fw-bold">
                Course / Program <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="course"
                name="course"
                className="form-control form-control-lg"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. Business Administration"
                required
                disabled={saving}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-success btn-lg w-100 fw-bold"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Save Changes
                </>
              )}
            </button>
          </form>

          {/* Profile Info Box */}
          <div className="mt-5 p-3 bg-light rounded">
            <h6 className="fw-bold mb-3" style={{ color: "#003087" }}>
              <i className="bi bi-info-circle me-2"></i>
              Why we collect this information
            </h6>
            <ul className="text-muted small mb-0">
              <li><strong>Full Name:</strong> So other students know who you are</li>
              <li><strong>Section:</strong> To help build community within your section</li>
              <li><strong>Intake Month:</strong> To connect you with students in your cohort</li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="mt-3 p-3 bg-info bg-opacity-10 rounded border border-info">
            <small className="text-muted">
              <i className="bi bi-shield-check me-2" style={{ color: "#003087" }}></i>
              <strong>Privacy:</strong> Your profile information is only visible to other logged-in users for safety and security purposes.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;