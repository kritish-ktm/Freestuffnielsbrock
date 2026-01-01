// src/pages/ManageRequests.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import { Link } from "react-router-dom";

function ManageRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      // Get all items posted by current user
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

      // Get all requests for those items
      const { data: requestsData, error: requestsError } = await supabase
        .from("requests")
        .select("*")
        .in("item_id", itemIds)
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;

      // Combine requests with item info
      const enrichedRequests = requestsData.map(request => {
        const item = userItems.find(i => i.id === request.item_id);
        return {
          ...request,
          item_name: item?.name,
          item_image: item?.image
        };
      });

      setRequests(enrichedRequests);
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

      // Update local state
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));

      alert(`✅ Request ${newStatus}!`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("❌ Failed to update request");
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
          <i className="bi bi-inbox me-2"></i>
          Manage Interest Requests
        </h2>
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
    </div>
  );
}

export default ManageRequests;