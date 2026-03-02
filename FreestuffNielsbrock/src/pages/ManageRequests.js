// src/pages/ManageRequests.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";

function ManageRequests() {
  const { user } = useAuth();
  const { refreshNotifications, markAllIncomingAsRead } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // ── Toast state ──────────────────────────────────────────────────────────
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: "", text: "" });

  const showNotification = (type, text) => {
    setToastMessage({ type, text });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      markAllIncomingAsRead();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const { data: userItems, error: itemsError } = await supabase
        .from("items")
        .select("id, name, image")
        .eq("posted_by", user.id);

      if (itemsError) throw itemsError;

      if (!userItems || userItems.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const itemIds = userItems.map(item => item.id);

      const { data: requestsData, error: requestsError } = await supabase
        .from("requests")
        .select("*")
        .in("item_id", itemIds)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      const enrichedRequests = requestsData.map(request => {
        const item = userItems.find(i => i.id === request.item_id);
        return {
          ...request,
          item_name: item?.name,
          item_image: item?.image
        };
      });

      setRequests(enrichedRequests);

      const unreadIds = requestsData
        .filter(req => !req.read_by_poster)
        .map(req => req.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("requests")
          .update({ read_by_poster: true })
          .in("id", unreadIds);

        refreshNotifications();
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      showNotification("error", "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      setRequests(requests.map(req =>
        req.id === requestId ? { ...req, status: newStatus } : req
      ));

      // ✅ Replaced: alert(`✅ Request ${newStatus}!`)
      showNotification("success", `Request ${newStatus}!`);

      refreshNotifications();
    } catch (error) {
      console.error("Error updating status:", error);
      // ✅ Replaced: alert("❌ Failed to update request")
      showNotification("error", "Failed to update request");
    }
  };

  const getPlaceholderImage = (id) => {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', 'fa709a', '43e97b'];
    const color = colors[id % colors.length];
    return `https://via.placeholder.com/80x80/${color}/ffffff?text=Item`;
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(req => req.status === filter);

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: "#003087" }}>
          <i className="bi bi-inbox-fill text-success me-2"></i>
          Manage Interest Requests
        </h2>
        <button
          className="btn btn-outline-primary"
          onClick={fetchRequests}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      <p className="text-muted mb-4">
        Review and approve requests from people interested in your items. Once approved, they can contact you on WhatsApp.
      </p>

      {/* Filter Buttons */}
      <div className="btn-group mb-4" role="group">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilter('all')}
        >
          All ({requests.length})
        </button>
        <button
          className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          className={`btn ${filter === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({requests.filter(r => r.status === 'approved').length})
        </button>
        <button
          className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({requests.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
          <p className="text-muted mt-3">
            {filter === 'all'
              ? 'No requests yet. When someone expresses interest in your items, they will appear here.'
              : `No ${filter} requests.`
            }
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredRequests.map(request => (
            <div key={request.id} className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <div className="row align-items-center">
                    {/* Item Image & Info */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <img
                          src={request.item_image || getPlaceholderImage(request.item_id)}
                          alt={request.item_name}
                          className="rounded"
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
                          onError={(e) => { e.target.src = getPlaceholderImage(request.item_id); }}
                        />
                        <div className="ms-3">
                          <h6 className="mb-0 fw-bold">{request.item_name}</h6>
                          <Link
                            to={`/product/${request.item_id}`}
                            className="text-muted small text-decoration-none"
                          >
                            View Item <i className="bi bi-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Requester Info */}
                    <div className="col-md-3">
                      <div>
                        <strong className="d-block" style={{ color: "#003087" }}>
                          <i className="bi bi-person-circle me-1"></i>
                          {request.requester_name}
                        </strong>
                        <small className="text-muted d-block">
                          <i className="bi bi-envelope me-1"></i>
                          {request.requester_email}
                        </small>
                        <small className="text-muted d-block">
                          <i className="bi bi-calendar me-1"></i>
                          {new Date(request.created_at).toLocaleDateString()}
                        </small>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="col-md-2 text-center">
                      <span className={`badge fs-6 ${
                        request.status === 'pending' ? 'bg-warning text-dark' :
                        request.status === 'approved' ? 'bg-success' :
                        'bg-danger'
                      }`}>
                        {request.status === 'pending' && <i className="bi bi-clock me-1"></i>}
                        {request.status === 'approved' && <i className="bi bi-check-circle me-1"></i>}
                        {request.status === 'rejected' && <i className="bi bi-x-circle me-1"></i>}
                        {request.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-md-4">
                      {request.status === 'pending' ? (
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUpdateStatus(request.id, 'approved')}
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUpdateStatus(request.id, 'rejected')}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Reject
                          </button>
                        </div>
                      ) : request.status === 'approved' ? (
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleUpdateStatus(request.id, 'rejected')}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Revoke Access
                          </button>
                          <small className="text-success text-center">
                            <i className="bi bi-whatsapp me-1"></i>
                            Can contact you
                          </small>
                        </div>
                      ) : (
                        <div className="d-grid">
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleUpdateStatus(request.id, 'approved')}
                          >
                            <i className="bi bi-arrow-counterclockwise me-1"></i>
                            Approve Now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Animated Toast Notification ─────────────────────────────────── */}
      {showToast && (
        <div
          className="position-fixed top-50 start-50 translate-middle"
          style={{
            zIndex: 9999,
            animation: "fadeInScale 0.3s ease-out",
            width: "90%",
            maxWidth: "400px",
          }}
        >
          <div
            className={`alert alert-${
              toastMessage.type === "success" ? "success" :
              toastMessage.type === "error"   ? "danger"  :
              toastMessage.type === "warning" ? "warning" : "info"
            } d-flex align-items-center shadow-lg mb-0`}
            role="alert"
            style={{ borderRadius: "12px", border: "none", padding: "1rem 1.5rem" }}
          >
            <i
              className={`bi ${
                toastMessage.type === "success" ? "bi-check-circle-fill" :
                toastMessage.type === "error"   ? "bi-x-circle-fill"     :
                toastMessage.type === "warning" ? "bi-exclamation-triangle-fill" :
                "bi-info-circle-fill"
              } me-3`}
              style={{ fontSize: "2rem" }}
            ></i>
            <div className="flex-grow-1 fw-semibold">{toastMessage.text}</div>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInScale {
          0%   { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1);   }
        }
      `}</style>
      {/* ──────────────────────────────────────────────────────────────────── */}
    </div>
  );
}

export default ManageRequests;