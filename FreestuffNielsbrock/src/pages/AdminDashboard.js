import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_users: 0,
    total_items: 0,
    total_requests: 0,
    flagged_items: 0,
    suspended_users: 0,
    pending_reports: 0,
  });
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.user_metadata?.is_admin) {
        navigate("/admin/login", { replace: true });
        return;
      }
    } catch (error) {
      console.error("Access check error:", error);
      navigate("/admin/login", { replace: true });
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch total users
      const { count: usersCount } = await supabase
        .from("auth.users")
        .select("*", { count: "exact" });

      // Fetch total items
      const { count: itemsCount } = await supabase
        .from("items")
        .select("*", { count: "exact" });

      // Fetch total requests
      const { count: requestsCount } = await supabase
        .from("requests")
        .select("*", { count: "exact" });

      // Fetch flagged items
      const { count: flaggedCount } = await supabase
        .from("items")
        .select("*", { count: "exact" })
        .eq("is_flagged", true);

      // Fetch pending reports
      const { count: reportsCount } = await supabase
        .from("reports")
        .select("*", { count: "exact" })
        .eq("status", "pending");

      setStats({
        total_users: usersCount || 0,
        total_items: itemsCount || 0,
        total_requests: requestsCount || 0,
        flagged_items: flaggedCount || 0,
        suspended_users: 0,
        pending_reports: reportsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("admin_token");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark shadow-sm">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1">
            <i className="bi bi-shield-lock me-2"></i>
            Admin Dashboard
          </span>
          <button
            className="btn btn-outline-light"
            onClick={handleLogout}
          >
            <i className="bi bi-door-open me-2"></i>
            Logout
          </button>
        </div>
      </nav>

      <div className="container-fluid p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="fw-bold" style={{ color: "#003087" }}>
            Platform Overview
          </h2>
          <p className="text-muted">Monitor and manage Free Stuff Niels Brock</p>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Total Users</p>
                    <h3 className="fw-bold" style={{ color: "#003087" }}>
                      {stats.total_users}
                    </h3>
                  </div>
                  <i className="bi bi-people-fill" style={{ fontSize: "2rem", color: "#003087" }}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Total Items</p>
                    <h3 className="fw-bold" style={{ color: "#00A9E0" }}>
                      {stats.total_items}
                    </h3>
                  </div>
                  <i className="bi bi-box-seam" style={{ fontSize: "2rem", color: "#00A9E0" }}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Total Requests</p>
                    <h3 className="fw-bold" style={{ color: "#28a745" }}>
                      {stats.total_requests}
                    </h3>
                  </div>
                  <i className="bi bi-hand-thumbs-up-fill" style={{ fontSize: "2rem", color: "#28a745" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alert Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-danger border-4 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Pending Reports</p>
                    <h3 className="fw-bold text-danger">
                      {stats.pending_reports}
                    </h3>
                  </div>
                  <i className="bi bi-exclamation-circle-fill" style={{ fontSize: "2rem", color: "#dc3545" }}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-warning border-4 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Flagged Items</p>
                    <h3 className="fw-bold text-warning">
                      {stats.flagged_items}
                    </h3>
                  </div>
                  <i className="bi bi-flag-fill" style={{ fontSize: "2rem", color: "#ffc107" }}></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm border-0 border-start border-secondary border-4 h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <p className="text-muted small mb-1">Suspended Users</p>
                    <h3 className="fw-bold text-secondary">
                      {stats.suspended_users}
                    </h3>
                  </div>
                  <i className="bi bi-slash-circle-fill" style={{ fontSize: "2rem", color: "#6c757d" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Panels */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light border-0 p-3">
                <h5 className="fw-bold mb-0" style={{ color: "#003087" }}>
                  <i className="bi bi-people me-2"></i>User Management
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">View and manage user accounts, suspend or ban fraudulent users.</p>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate("/admin/users")}
                >
                  <i className="bi bi-person-gear me-2"></i>Manage Users
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light border-0 p-3">
                <h5 className="fw-bold mb-0" style={{ color: "#003087" }}>
                  <i className="bi bi-box-seam me-2"></i>Item Moderation
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">Review and moderate posted items, remove inappropriate content.</p>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate("/admin/items")}
                >
                  <i className="bi bi-pencil-square me-2"></i>Moderate Items
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light border-0 p-3">
                <h5 className="fw-bold mb-0" style={{ color: "#003087" }}>
                  <i className="bi bi-exclamation-circle me-2"></i>Reports
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">View and manage user reports about fraudulent accounts or items.</p>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate("/admin/reports")}
                >
                  <i className="bi bi-file-earmark-text me-2"></i>View Reports
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light border-0 p-3">
                <h5 className="fw-bold mb-0" style={{ color: "#003087" }}>
                  <i className="bi bi-graph-up me-2"></i>Analytics
                </h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">View detailed platform analytics and user behavior data.</p>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate("/admin/security-analytics")}
                >
                  <i className="bi bi-bar-chart me-2"></i>View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;