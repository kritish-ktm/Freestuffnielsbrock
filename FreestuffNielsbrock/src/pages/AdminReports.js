import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");

  useEffect(() => {
    checkAdminAccess();
    fetchReports();
  }, [filterStatus]);

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

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      setMessage("Error loading reports: " + error.message);
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: newStatus })
        .eq("id", reportId);

      if (error) throw error;

      setMessage(`✅ Report marked as ${newStatus}`);
      setMessageType("success");
      fetchReports();
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setMessageType("danger");
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;

    try {
      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);

      if (error) throw error;

      setMessage("✅ Report deleted successfully");
      setMessageType("success");
      fetchReports();
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setMessageType("danger");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-warning",
      reviewed: "bg-info",
      resolved: "bg-success",
    };
    return badges[status] || "bg-secondary";
  };

  const getTypeBadge = (type) => {
    const badges = {
      user: "bg-danger",
      item: "bg-warning",
    };
    return badges[type] || "bg-secondary";
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
            <i className="bi bi-exclamation-circle me-2"></i>
            Admin - Reports Management
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
              <i className="bi bi-file-earmark-text me-2"></i>User & Item Reports
            </h4>
            
            <div className="btn-group" role="group">
              <button
                type="button"
                className={`btn ${filterStatus === "all" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setFilterStatus("all")}
              >
                All Reports ({reports.length})
              </button>
              <button
                type="button"
                className={`btn ${filterStatus === "pending" ? "btn-warning" : "btn-outline-warning"}`}
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </button>
              <button
                type="button"
                className={`btn ${filterStatus === "reviewed" ? "btn-info" : "btn-outline-info"}`}
                onClick={() => setFilterStatus("reviewed")}
              >
                Reviewed
              </button>
              <button
                type="button"
                className={`btn ${filterStatus === "resolved" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setFilterStatus("resolved")}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr style={{ borderTop: "2px solid #dee2e6" }}>
                <th>Report ID</th>
                <th>Type</th>
                <th>Reported ID</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.length > 0 ? (
                reports.map(report => (
                  <tr key={report.id}>
                    <td className="fw-bold">{report.id.substring(0, 8)}...</td>
                    <td>
                      <span className={`badge ${getTypeBadge(report.report_type)}`}>
                        {report.report_type}
                      </span>
                    </td>
                    <td>{report.reported_id.substring(0, 8)}...</td>
                    <td>{report.reason}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                    </td>
                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-info"
                          onClick={() => handleUpdateStatus(report.id, "reviewed")}
                          disabled={report.status === "reviewed"}
                          title="Mark as reviewed"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn btn-outline-success"
                          onClick={() => handleUpdateStatus(report.id, "resolved")}
                          disabled={report.status === "resolved"}
                          title="Mark as resolved"
                        >
                          <i className="bi bi-check-circle"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteReport(report.id)}
                          title="Delete report"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No reports found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="alert alert-info mt-4">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Total Reports:</strong> {reports.length}
        </div>
      </div>
    </div>
  );
}

export default AdminReports;