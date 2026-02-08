import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabase";

function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();

    // ✅ support /admin/users?search=
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) setSearchTerm(search);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.user_metadata?.is_admin) {
        navigate("/admin/login", { replace: true });
      }
    } catch (error) {
      navigate("/admin/login", { replace: true });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Error loading users: " + error.message);
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!window.confirm("Are you sure you want to suspend this user?")) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_suspended: true, suspended_at: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;

      setMessage("✅ User suspended successfully");
      setMessageType("success");
      fetchUsers();
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setMessageType("danger");
    }
  };

  const handleUnsuspendUser = async (userId) => {
    if (!window.confirm("Are you sure you want to unsuspend this user?")) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ is_suspended: false, suspended_at: null })
        .eq("user_id", userId);

      if (error) throw error;

      setMessage("✅ User unsuspended successfully");
      setMessageType("success");
      fetchUsers();
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setMessageType("danger");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", userId);

      if (error) throw error;

      setMessage("✅ User deleted successfully");
      setMessageType("success");
      fetchUsers();
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setMessageType("danger");
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Admin - User Management
          </span>
          <button className="btn btn-outline-light" onClick={() => navigate("/admin/dashboard")}>
            <i className="bi bi-arrow-left me-2"></i>Back
          </button>
        </div>
      </nav>

      <div className="container-fluid p-4">
        {message && (
          <div className={`alert alert-${messageType} alert-dismissible fade show`} role="alert">
            {message}
            <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
          </div>
        )}

        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-3" style={{ color: "#003087" }}>
              <i className="bi bi-people me-2"></i>User Management
            </h4>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr style={{ borderTop: "2px solid #dee2e6" }}>
                <th>Name</th>
                <th>Email</th>
                <th>Section</th>
                <th>Intake Month</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.user_id}>
                    <td className="fw-bold">{user.full_name || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>{user.section || "N/A"}</td>
                    <td>{user.intake_month || "N/A"}</td>
                    <td>
                      {user.is_suspended ? (
                        <span className="badge bg-danger">
                          <i className="bi bi-slash-circle me-1"></i>Suspended
                        </span>
                      ) : (
                        <span className="badge bg-success">
                          <i className="bi bi-check-circle me-1"></i>Active
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm me-2 ${user.is_suspended ? "btn-success" : "btn-warning"}`}
                        onClick={() =>
                          user.is_suspended
                            ? handleUnsuspendUser(user.user_id)
                            : handleSuspendUser(user.user_id)
                        }
                        title={user.is_suspended ? "Unsuspend user" : "Suspend user"}
                      >
                        <i className={`bi ${user.is_suspended ? "bi-arrow-counterclockwise" : "bi-pause-circle"}`}></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(user.user_id)}
                        title="Delete user"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="alert alert-info mt-4">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Total Users:</strong> {users.length} | <strong>Showing:</strong> {filteredUsers.length}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
