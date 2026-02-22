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
  const [filter, setFilter] = useState("all");
  const [donatingId, setDonatingId] = useState(null); // tracks which item is being marked donated

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  useEffect(() => {
    if (user) markAllIncomingAsRead();
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const { data: userItems, error: itemsError } = await supabase
        .from("items")
        .select("id, name, image, is_donated")
        .eq("posted_by", user.id);

      if (itemsError) throw itemsError;

      if (!userItems || userItems.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const itemIds = userItems.map((item) => item.id);

      const { data: requestsData, error: requestsError } = await supabase
        .from("requests")
        .select("*")
        .in("item_id", itemIds)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      const enrichedRequests = requestsData.map((request) => {
        const item = userItems.find((i) => i.id === request.item_id);
        return {
          ...request,
          item_name: item?.name,
          item_image: item?.image,
          item_is_donated: item?.is_donated || false,
        };
      });

      setRequests(enrichedRequests);

      // Mark unread as read
      const unreadIds = requestsData.filter((req) => !req.read_by_poster).map((req) => req.id);
      if (unreadIds.length > 0) {
        await supabase.from("requests").update({ read_by_poster: true }).in("id", unreadIds);
        refreshNotifications();
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      alert("Failed to load requests");
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

      setRequests(requests.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req)));
      alert(`Request ${newStatus}!`);
      refreshNotifications();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update request");
    }
  };

  // ── Mark item as donated ──
  const handleMarkDonated = async (itemId, requesterName) => {
    if (!window.confirm(`Mark this item as donated to ${requesterName}? This will show it as donated on the platform and count towards the community donation counter.`)) return;

    setDonatingId(itemId);
    try {
      const { error } = await supabase
        .from("items")
        .update({
          is_donated: true,
          donated_at: new Date().toISOString(),
        })
        .eq("id", itemId)
        .eq("posted_by", user.id);

      if (error) throw error;

      // Update local state so button reflects immediately
      setRequests((prev) =>
        prev.map((req) =>
          req.item_id === itemId ? { ...req, item_is_donated: true } : req
        )
      );

      alert("Item marked as donated! It now counts towards the community counter.");
    } catch (error) {
      console.error("Error marking as donated:", error);
      alert("Failed to mark as donated: " + error.message);
    } finally {
      setDonatingId(null);
    }
  };

  const getPlaceholderImage = (id) => {
    const colors = ["667eea", "764ba2", "f093fb", "4facfe", "fa709a", "43e97b"];
    const color = colors[(id || 0) % colors.length];
    return `https://via.placeholder.com/80x80/${color}/ffffff?text=Item`;
  };

  const filteredRequests =
    filter === "all" ? requests : requests.filter((req) => req.status === filter);

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
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h2 style={{ color: "#003087" }}>
          <i className="bi bi-inbox-fill text-success me-2"></i>
          Manage Interest Requests
        </h2>
        <button className="btn btn-outline-primary" onClick={fetchRequests} disabled={loading}>
          <i className="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </div>

      <p className="text-muted mb-4">
        Review and approve requests from people interested in your items. Once approved, you can also mark items as <strong>donated</strong> once the handover is complete.
      </p>

      {/* Filter Buttons */}
      <div className="btn-group mb-4 flex-wrap" role="group">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            className={`btn ${
              filter === f
                ? f === "all" ? "btn-primary"
                  : f === "pending" ? "btn-warning"
                  : f === "approved" ? "btn-success"
                  : "btn-danger"
                : f === "all" ? "btn-outline-primary"
                : f === "pending" ? "btn-outline-warning"
                : f === "approved" ? "btn-outline-success"
                : "btn-outline-danger"
            }`}
            onClick={() => setFilter(f)}
          >
            {f === "all" && `All (${requests.length})`}
            {f === "pending" && `Pending (${requests.filter((r) => r.status === "pending").length})`}
            {f === "approved" && `Approved (${requests.filter((r) => r.status === "approved").length})`}
            {f === "rejected" && `Rejected (${requests.filter((r) => r.status === "rejected").length})`}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
          <p className="text-muted mt-3">
            {filter === "all"
              ? "No requests yet. When someone expresses interest in your items, they will appear here."
              : `No ${filter} requests.`}
          </p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredRequests.map((request) => (
            <div key={request.id} className="col-12">
              <div
                className="card shadow-sm border-0"
                style={{
                  borderLeft: request.item_is_donated
                    ? "4px solid #7FD856 !important"
                    : undefined,
                  background: request.item_is_donated ? "#f0fff4" : undefined,
                }}
              >
                <div className="card-body">
                  <div className="row align-items-center g-3">

                    {/* Item Image & Info */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <div className="position-relative">
                          <img
                            src={request.item_image || getPlaceholderImage(request.item_id)}
                            alt={request.item_name}
                            className="rounded"
                            style={{ width: "80px", height: "80px", objectFit: "cover" }}
                            onError={(e) => { e.target.src = getPlaceholderImage(request.item_id); }}
                          />
                          {request.item_is_donated && (
                            <span
                              className="position-absolute top-0 start-0 badge"
                              style={{ background: "#7FD856", color: "#003087", fontSize: "0.65rem" }}
                            >
                              Donated
                            </span>
                          )}
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-0 fw-bold">{request.item_name}</h6>
                          <Link to={`/product/${request.item_id}`} className="text-muted small text-decoration-none">
                            View Item <i className="bi bi-arrow-right"></i>
                          </Link>
                          {request.item_is_donated && (
                            <div>
                              <small className="text-success fw-semibold">
                                <i className="bi bi-patch-check-fill me-1"></i>Donated
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Requester Info */}
                    <div className="col-md-3">
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

                    {/* Status Badge */}
                    <div className="col-md-2 text-center">
                      <span
                        className={`badge fs-6 ${
                          request.status === "pending"
                            ? "bg-warning text-dark"
                            : request.status === "approved"
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        {request.status === "pending" && <i className="bi bi-clock me-1"></i>}
                        {request.status === "approved" && <i className="bi bi-check-circle me-1"></i>}
                        {request.status === "rejected" && <i className="bi bi-x-circle me-1"></i>}
                        {request.status.toUpperCase()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-md-4">
                      {request.status === "pending" && (
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUpdateStatus(request.id, "approved")}
                          >
                            <i className="bi bi-check-circle me-1"></i>Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUpdateStatus(request.id, "rejected")}
                          >
                            <i className="bi bi-x-circle me-1"></i>Reject
                          </button>
                        </div>
                      )}

                      {request.status === "approved" && (
                        <div className="d-grid gap-2">
                          {/* ── Mark as Donated button ── */}
                          {!request.item_is_donated ? (
                            <button
                              className="btn btn-sm fw-semibold"
                              style={{
                                background: "linear-gradient(135deg,#003087,#005fa3)",
                                color: "#fff",
                                border: "none",
                              }}
                              onClick={() => handleMarkDonated(request.item_id, request.requester_name)}
                              disabled={donatingId === request.item_id}
                            >
                              {donatingId === request.item_id ? (
                                <><span className="spinner-border spinner-border-sm me-1" />Marking...</>
                              ) : (
                                <><i className="bi bi-gift-fill me-1"></i>Mark as Donated</>
                              )}
                            </button>
                          ) : (
                            <div
                              className="text-center py-1 rounded"
                              style={{ background: "#d4edda", color: "#155724", fontSize: "0.85rem" }}
                            >
                              <i className="bi bi-patch-check-fill me-1"></i>
                              Item donated to {request.requester_name}
                            </div>
                          )}

                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleUpdateStatus(request.id, "rejected")}
                          >
                            <i className="bi bi-x-circle me-1"></i>Revoke Access
                          </button>
                          <small className="text-success text-center">
                            <i className="bi bi-whatsapp me-1"></i>Can contact you
                          </small>
                        </div>
                      )}

                      {request.status === "rejected" && (
                        <div className="d-grid">
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handleUpdateStatus(request.id, "approved")}
                          >
                            <i className="bi bi-arrow-counterclockwise me-1"></i>Approve Now
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
    </div>
  );
}

export default ManageRequests;