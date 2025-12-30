import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    section: "",
    intake_month: "",
    phone_number: "",
    dob: "",
    campus_id: "",
    course: "",
  });

  /* ---------- LOAD PROFILE ---------- */
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setFormData({
      full_name: user.user_metadata?.full_name || "",
      section: user.user_metadata?.section || "",
      intake_month: user.user_metadata?.intake_month || "",
      phone_number: user.user_metadata?.phone_number || "",
      dob: user.user_metadata?.dob || "",
      campus_id: user.user_metadata?.campus_id || "",
      course: user.user_metadata?.course || "",
    });
  }, [user, navigate]);

  /* ---------- HANDLERS ---------- */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        data: formData,
      });

      if (error) throw error;
      setMessage("Saved");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="container-fluid my-4">
      <div className="row g-4">

        {/* SIDEBAR (DESKTOP) */}
        <aside className="col-lg-3 d-none d-lg-block">
          <div className="card border-0 shadow-sm">
            <div className="card-body">

              {/* AVATAR */}
              <div className="text-center mb-4">
                <label className="avatar-wrapper">
                  <input type="file" hidden onChange={handleAvatarChange} />
                  <img
                    src={avatarPreview || "/avatar-placeholder.png"}
                    alt="Avatar"
                    className="avatar-img"
                  />
                </label>

                <h6 className="fw-bold mt-2 mb-1">
  {formData.full_name || "Local Guide"}
</h6>
<small className="text-muted d-block">
  {user.email}
</small>
<small className="badge bg-light text-dark mt-2">
  Student
</small>

              </div>

              {/* NAV */}
              {/* Dashboard Tabs */}
<div className="dashboard-tabs mb-4">
  <button
    className={`tab-btn ${activeTab === "basic" ? "active" : ""}`}
    onClick={() => setActiveTab("basic")}
  >
    Basic Info
  </button>

  <button
    className={`tab-btn ${activeTab === "contact" ? "active" : ""}`}
    onClick={() => setActiveTab("contact")}
  >
    Contact
  </button>

  <button
    className={`tab-btn ${activeTab === "student" ? "active" : ""}`}
    onClick={() => setActiveTab("student")}
  >
    Student Info
  </button>

  <button
    className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
    onClick={() => setActiveTab("security")}
  >
    Security
  </button>

  <div
    className="tab-indicator"
    style={{
      transform:
        activeTab === "basic"
          ? "translateX(0%)"
          : activeTab === "contact"
          ? "translateX(100%)"
          : activeTab === "student"
          ? "translateX(200%)"
          : "translateX(300%)",
    }}
  />
</div>


            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="col-lg-9">

          {/* MINI STATS */}
         <div className="row g-3 mb-4">
  <div className="col-sm-6 col-md-3">
    <div className="stat-card">
      <span className="stat-label">Profile</span>
      <span className="stat-value">Active</span>
    </div>
  </div>

  <div className="col-sm-6 col-md-3">
    <div className="stat-card">
      <span className="stat-label">Semester</span>
      <span className="stat-value">
        {formData.intake_month || "—"}
      </span>
    </div>
  </div>
</div>


          {/* CONTENT */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              {/* BASIC INFO */}
              {activeTab === "basic" && (
                <>
                  <h6 className="section-title">Basic Info</h6>
                  <input
                    className="form-control mb-3"
                    name="full_name"
                    placeholder="Full name"
                    value={formData.full_name}
                    onChange={handleChange}
                  />
                  <input
                    className="form-control"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* CONTACT */}
              {activeTab === "contact" && (
                <>
                  <h6 className="section-title">Contact</h6>
                  <input
                    className="form-control mb-3"
                    name="phone_number"
                    placeholder="Phone number"
                    value={formData.phone_number}
                    onChange={handleChange}
                  />
                  <input
                    className="form-control"
                    value={user.email}
                    disabled
                  />
                </>
              )}

              {/* STUDENT INFO */}
              {activeTab === "student" && (
                <>
                  <h6 className="section-title">Student Info</h6>
                  <input
                    className="form-control mb-3"
                    name="section"
                    placeholder="Section"
                    value={formData.section}
                    onChange={handleChange}
                  />
                  <input
                    className="form-control mb-3"
                    name="campus_id"
                    placeholder="Student ID"
                    value={formData.campus_id}
                    onChange={handleChange}
                  />
                  <input
                    className="form-control"
                    name="course"
                    placeholder="Course"
                    value={formData.course}
                    onChange={handleChange}
                  />
                </>
              )}

              {/* SECURITY */}
              {activeTab === "security" && (
                <>
                  <h6 className="section-title">Security</h6>
                  <p className="text-muted small">
                    Password changes are handled securely via email.
                  </p>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      supabase.auth.resetPasswordForEmail(user.email)
                    }
                  >
                    Send password reset email
                  </button>
                </>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* STICKY SAVE BAR */}
      <div className="save-bar">
        <span className="text-muted small">{message}</span>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {/* STYLES */}
      <style>{`
      .dashboard-tabs {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.tab-btn {
  background: none;
  border: none;
  padding: 12px 0;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  position: relative;
}

.tab-btn.active {
  color: #003087;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 25%;
  height: 3px;
  background: #003087;
  border-radius: 2px;
  transition: transform 0.3s ease;
}

    
      .card-body > *+* {
        margin-top: 8px;
      }

  .stat-card {
  background: #f8f9fb;
  padding: 14px 16px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #111;
}

        .avatar-wrapper { cursor: pointer; }
        .avatar-img {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          object-fit: cover;
          background: #eee;
        }

        .dashboard-nav .nav-btn {
          width: 100%;
          text-align: left;
          border: none;
          background: none;
          padding: 10px 12px;
          border-radius: 6px;
          margin-bottom: 4px;
        }
        .dashboard-nav .nav-btn.active {
          background: #003087;
          color: white;
        }

        .stat-card {
          background: #f8f9fb;
          padding: 12px;
          border-radius: 8px;
        }

        .section-title {
          font-weight: 600;
          margin-bottom: 12px;
        }

        .save-bar {
          position: sticky;
          bottom: 0;
          background: white;
          border-top: 1px solid #eee;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
}

export default Profile;
