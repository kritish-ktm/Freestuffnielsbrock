// src/pages/UserProfile.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [userItems, setUserItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // If viewing own profile, redirect to /profile
    if (currentUser.id === userId) {
      navigate("/profile");
      return;
    }

    loadUserProfile();
  }, [userId, currentUser, navigate]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      // Try to get profile from user_profiles table first
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Load user's items regardless
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('posted_by', userId)
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error("Error fetching items:", itemsError);
      }
      
      setUserItems(items || []);

      if (profileError) {
        console.log("Profile not found in user_profiles, using items data:", profileError);
        
        // Fallback: Get profile info from items table
        if (!items || items.length === 0) {
          setError("User profile not found");
          setLoading(false);
          return;
        }

        // Get profile info from first item
        const firstItem = items[0];
        setUserProfile({
          full_name: firstItem.posted_by_name || "Unknown User",
          section: firstItem.posted_by_section || "N/A",
          email: firstItem.posted_by_email || "",
          course: "N/A"
        });
      } else {
        // Profile found in user_profiles table
        setUserProfile({
          full_name: profileData.full_name || "Unknown User",
          section: profileData.section || "N/A",
          email: profileData.email || "",
          course: profileData.course || "N/A"
        });
      }

    } catch (err) {
      console.error("Error loading user profile:", err);
      setError("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderImage = (id) => {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', 'fa709a', '43e97b'];
    const color = colors[id % colors.length];
    return `https://via.placeholder.com/300x200/${color}/ffffff?text=Item`;
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

  if (error) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container my-5 text-center">
        <p>User not found</p>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">
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

      <div className="row g-4">
        {/* Profile Card Display - Read Only */}
        <div className="col-lg-4">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              {/* Profile Header */}
              <div className="text-center mb-4">
                <div 
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "100px",
                    height: "100px",
                    backgroundColor: "#003087",
                    color: "white",
                    fontSize: "2.5rem"
                  }}
                >
                  <i className="bi bi-person-fill"></i>
                </div>
                <h4 className="fw-bold mb-1" style={{ color: "#003087" }}>
                  {userProfile.full_name}
                </h4>
                <p className="text-muted mb-0">{userProfile.section}</p>
              </div>

              <hr />

              {/* Profile Details - Limited Info */}
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-diagram-3 me-2" style={{ color: "#003087" }}></i>
                  <small className="text-muted">Section</small>
                </div>
                <p className="mb-0 ms-4">{userProfile.section}</p>
              </div>

              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <i className="bi bi-mortarboard-fill me-2" style={{ color: "#003087" }}></i>
                  <small className="text-muted">Course</small>
                </div>
                <p className="mb-0 ms-4">{userProfile.course}</p>
              </div>

              <hr />

              {/* Stats */}
              <div className="text-center">
                <h5 className="mb-2" style={{ color: "#003087" }}>
                  {userItems.length}
                </h5>
                <p className="text-muted small mb-0">Items Posted</p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="card border-info mt-3">
            <div className="card-body p-3">
              <small className="text-muted">
                <i className="bi bi-info-circle me-2" style={{ color: "#003087" }}></i>
                Limited profile information is shown to protect user privacy.
              </small>
            </div>
          </div>
        </div>

        {/* User's Posted Items */}
        <div className="col-lg-8">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h3 className="fw-bold mb-4" style={{ color: "#003087" }}>
                <i className="bi bi-grid me-2"></i>
                Items Posted by {userProfile.full_name}
              </h3>

              {userItems.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                  <p className="text-muted mt-3">This user hasn't posted any items yet.</p>
                </div>
              ) : (
                <div className="row g-3">
                  {userItems.map(item => (
                    <div key={item.id} className="col-md-6 mb-3">
                      <div className="card h-100 shadow-sm">
                        <img
                          src={item.image || getPlaceholderImage(item.id)}
                          className="card-img-top"
                          alt={item.name}
                          style={{ height: "150px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = getPlaceholderImage(item.id);
                          }}
                        />
                        <div className="card-body">
                          <h6 className="card-title">{item.name}</h6>
                          <p className="card-text text-muted small">
                            {item.description?.substring(0, 60) || "No description"}...
                          </p>
                          
                          {item.condition && (
                            <p className="text-muted small mb-2">
                              <i className="bi bi-star me-1"></i>
                              {item.condition}
                            </p>
                          )}

                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="h6 mb-0 text-success">
                              {item.price === 0 ? "FREE" : `${item.price} DKK`}
                            </span>
                            <span className="badge bg-info text-dark" style={{ fontSize: "0.75rem" }}>
                              {item.category || "General"}
                            </span>
                          </div>

                          {item.location && (
                            <p className="text-muted small mb-3">
                              <i className="bi bi-geo-alt me-1"></i>
                              {item.location}
                            </p>
                          )}

                          <button
                            onClick={() => navigate(`/product/${item.id}`)}
                            className="btn btn-outline-primary btn-sm w-100"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
