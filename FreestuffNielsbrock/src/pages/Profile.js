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

  /* ---------------- LOAD PROFILE ---------------- */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const loadProfile = async () => {
      setLoading(true);

      try {
        setFormData({
          full_name: user.user_metadata?.full_name || "",
          section: user.user_metadata?.section || "",
          intake_month: user.user_metadata?.intake_month || "",
          phone_number: user.user_metadata?.phone_number || "",
          dob: user.user_metadata?.dob || "",
          campus_id: user.user_metadata?.campus_id || "",
          course: user.user_metadata?.course || "",
        });
      } catch (err) {
        setMessage("Failed to load profile");
        setMessageType("danger");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { ...formData },
      });

      if (error) throw error;

      setMessage("Profile updated successfully");
      setMessageType("success");
    } catch (err) {
      setMessage(err.message);
      setMessageType("danger");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return (
      <div className="container text-center my-5">
        <div className="spinner-border text-primary" />
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="container my-5">

      {/* HEADER */}
      <div className="mb-4">
        <button
          className="btn btn-link p-0 mb-2"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h2 className="fw-bold">My Dashboard</h2>
        <p className="text-muted">
          Manage your profile and student information
        </p>
      </div>

      <div className="row g-4">

        {/* SIDEBAR */}
        <div className="col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">

              <div className="avatar-circle mb-3">
                <i className="bi bi-person-fill"></i>
              </div>

              <h5 className="fw-bold mb-0">
                {formData.full_name || "No Name"}
              </h5>
              <small className="text-muted">
                {formData.section || "No Section"}
              </small>

              <span className="badge bg-success d-block mt-2">
                Active Student
              </span>

              <hr />

              <ul className="list-unstyled small text-muted text-start">
                <li className="mb-2">
                  <i className="bi bi-envelope me-2"></i>
                  {user?.email}
                </li>
                <li className="mb-2">
                  <i className="bi bi-calendar me-2"></i>
                  {formData.intake_month || "—"}
                </li>
                <li>
                  <i className="bi bi-mortarboard me-2"></i>
                  {formData.course || "—"}
                </li>
              </ul>

            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="col-lg-8 col-xl-9">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">

              <h5 className="fw-bold mb-3">
                Edit Profile
              </h5>

              {message && (
                <div className={`alert alert-${messageType}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                <div className="row g-3">

                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-control"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Section</label>
                    <input
                      type="text"
                      name="section"
                      className="form-control"
                      value={formData.section}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Intake Month</label>
                    <select
                      name="intake_month"
                      className="form-select"
                      value={formData.intake_month}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select</option>
                      {[
                        "January","February","March","April","May","June",
                        "July","August","September","October","November","December"
                      ].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      name="phone_number"
                      className="form-control"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      className="form-control"
                      value={formData.dob}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      name="campus_id"
                      className="form-control"
                      value={formData.campus_id}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Course</label>
                    <input
                      type="text"
                      name="course"
                      className="form-control"
                      value={formData.course}
                      onChange={handleChange}
                    />
                  </div>

                </div>

                <div className="text-end mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary px-4"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>

      </div>

      {/* STYLE */}
      <style>{`
        .avatar-circle {
          width: 90px;
          height: 90px;
          background: linear-gradient(135deg, #003087, #0056d2);
          border-radius: 50%;
          color: white;
          font-size: 2.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: auto;
        }
      `}</style>

    </div>
  );
}

export default Profile;
