import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    const checkProfile = async () => {
      try {
        setLoading(true);
        
        const fullName = user.user_metadata?.full_name;
        const section = user.user_metadata?.section;

        if (fullName && section) {
          navigate("/");
          return;
        }

        setFormData(prev => ({
          ...prev,
          full_name: user.user_metadata?.full_name || "",
          section: user.user_metadata?.section || "",
          intake_month: user.user_metadata?.intake_month || "",
          phone_number: user.user_metadata?.phone_number || "",
          dob: user.user_metadata?.dob || "",
          campus_id: user.user_metadata?.campus_id || "",
          course: user.user_metadata?.course || "",
        }));
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
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

    if (!agreedToTerms) {
      setMessage("⚠️ Please agree to the Terms & Conditions");
      setMessageType("danger");
      return;
    }

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

    if (!formData.phone_number.trim()) {
      setMessage("⚠️ Please enter your phone number");
      setMessageType("danger");
      return;
    }

    if (!formData.dob) {
      setMessage("⚠️ Please enter your date of birth");
      setMessageType("danger");
      return;
    }

    if (!formData.campus_id.trim()) {
      setMessage("⚠️ Please enter your student ID");
      setMessageType("danger");
      return;
    }

    if (!formData.course.trim()) {
      setMessage("⚠️ Please select your course");
      setMessageType("danger");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name.trim(),
          section: formData.section.trim(),
          intake_month: formData.intake_month,
          phone_number: formData.phone_number.trim(),
          dob: formData.dob,
          campus_id: formData.campus_id.trim(),
          course: formData.course.trim(),
          profile_completed: true,
          profile_completed_date: new Date().toISOString(),
          gdpr_consent: true,
        }
      });

      if (error) throw error;

      setShowSuccessModal(true);

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("❌ Error: " + error.message);
      setMessageType("danger");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading...</p>
      </div>
    );
  }

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-body text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-check-circle" style={{ fontSize: "5rem", color: "#28a745" }}></i>
                </div>
                
                <h3 className="fw-bold mb-3" style={{ color: "#003087" }}>
                  Data Saved Successfully
                </h3>
                
                <p className="text-muted">
                  Your profile has been updated. Redirecting...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container my-5 pb-5" style={{ maxWidth: "750px" }}>
        <div className="card shadow-lg border-0">
          <div 
            className="card-header text-white p-5"
            style={{ background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)" }}
          >
            <h2 className="fw-bold mb-2">
              <i className="bi bi-shield-check me-2"></i>
              Verify Your Identity
            </h2>
            <p className="mb-0 fs-5">
              Complete your profile to access Free Stuff Niels Brock safely and securely
            </p>
          </div>

          <div className="card-body p-5">
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

            {/* Information Section */}
            <div className="mb-5 p-4 bg-light rounded border-start border-primary border-4">
              <h6 className="fw-bold mb-3" style={{ color: "#003087" }}>
                <i className="bi bi-info-circle me-2"></i>
                Why We Collect This Information
              </h6>
              <p className="text-muted mb-2">
                <strong>Community Safety:</strong> We verify student identity to maintain a secure, trustworthy community exclusive to Niels Brock students.
              </p>
              <p className="text-muted mb-0">
                <strong>Fraud Prevention:</strong> Identity verification helps us prevent misuse of the platform and protect our community members.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <h6 className="fw-bold mb-4" style={{ color: "#003087" }}>
                Complete the form below
              </h6>

              {/* Email (Read-only) */}
              <div className="mb-4">
                <label className="form-label fw-bold">
                  <i className="bi bi-envelope me-2"></i>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  value={user?.email || ""}
                  disabled
                />
                <small className="text-muted">Your primary account identifier</small>
              </div>

              {/* Full Name */}
              <div className="mb-4">
                <label htmlFor="full_name" className="form-label fw-bold">
                  <i className="bi bi-person me-2"></i>
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  className="form-control form-control-lg"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="First and last name as shown in official documents"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Section */}
              <div className="mb-4">
                <label htmlFor="section" className="form-label fw-bold">
                  <i className="bi bi-building me-2"></i>
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
                  disabled={submitting}
                />
                <small className="text-muted">Your academic section at Niels Brock</small>
              </div>

              {/* Intake Month */}
              <div className="mb-4">
                <label htmlFor="intake_month" className="form-label fw-bold">
                  <i className="bi bi-calendar-event me-2"></i>
                  Intake Month <span className="text-danger">*</span>
                </label>
                <select
                  id="intake_month"
                  name="intake_month"
                  className="form-select form-select-lg"
                  value={formData.intake_month}
                  onChange={handleChange}
                  required
                  disabled={submitting}
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
                <small className="text-muted">When you started at Niels Brock</small>
              </div>

              {/* Phone Number */}
              <div className="mb-4">
                <label htmlFor="phone_number" className="form-label fw-bold">
                  <i className="bi bi-telephone me-2"></i>
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  className="form-control form-control-lg"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+45 XXXX XXXX"
                  required
                  disabled={submitting}
                />
                <small className="text-muted">For account verification and recovery</small>
              </div>

              {/* Date of Birth */}
              <div className="mb-4">
                <label htmlFor="dob" className="form-label fw-bold">
                  <i className="bi bi-calendar me-2"></i>
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
                  disabled={submitting}
                />
                <small className="text-muted">Verify you are a Niels Brock student</small>
              </div>

              {/* Campus ID / Student ID */}
              <div className="mb-4">
                <label htmlFor="campus_id" className="form-label fw-bold">
                  <i className="bi bi-card-text me-2"></i>
                  Student ID <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="campus_id"
                  name="campus_id"
                  className="form-control form-control-lg"
                  value={formData.campus_id}
                  onChange={handleChange}
                  placeholder="Your Niels Brock student ID"
                  required
                  disabled={submitting}
                />
                <small className="text-muted">Verification of official student status</small>
              </div>

              {/* Course */}
              <div className="mb-5">
                <label htmlFor="course" className="form-label fw-bold">
                  <i className="bi bi-mortarboard me-2"></i>
                  Course / Program <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  className="form-control form-control-lg"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g. Business Administration, Software Development"
                  required
                  disabled={submitting}
                />
              </div>

              {/* Terms & Conditions */}
              <div className="mb-4 p-4 bg-warning bg-opacity-10 rounded border border-warning">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="agreeTerms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={submitting}
                  />
                  <label className="form-check-label" htmlFor="agreeTerms">
                    <strong>I agree to the Terms & Conditions</strong>
                  </label>
                </div>
                <small className="text-muted d-block mt-2">
                  By checking this box, I confirm that:
                </small>
                <ul className="text-muted small mt-2 mb-0 ps-4">
                  <li className="mb-1">I am a current Niels Brock student and the information provided is accurate</li>
                  <li className="mb-1">My data will be used only for community safety and fraud prevention</li>
                  <li className="mb-1">My data will be processed securely and in compliance with GDPR</li>
                  <li className="mb-1">My data will not be shared with third parties without my consent</li>
                  <li>Providing false information may result in account suspension</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-success btn-lg w-100 fw-bold"
                disabled={submitting || !agreedToTerms}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Save Profile
                  </>
                )}
              </button>

              <p className="text-muted text-center small mt-3">
                <i className="bi bi-lock-fill me-1" style={{ color: "#003087" }}></i>
                Your data is encrypted and secured. We take your privacy seriously.
              </p>
            </form>
          </div>

          {/* Footer */}
          <div className="card-footer bg-light p-4 text-center">
            <small className="text-muted">
              By completing this form, you certify that you are a current Niels Brock student.
              <br />
              <strong>Fraudulent information may result in account suspension.</strong>
            </small>
          </div>
        </div>
      </div>
    </>
  );
}

export default Onboarding;