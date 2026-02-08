import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

function Requests() {
  const { user } = useAuth();
  const { refreshNotifications, markAllUpdatesAsRead } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!user) return;

    fetchRequests();
  }, [user]);

  // Mark all updates as read when component mounts
  useEffect(() => {
    if (user) {
      markAllUpdatesAsRead();
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);

    try {
      // Get requests made BY the current user (not FOR the user's items)
      const { data, error } = await supabase
        .from("requests")
        .select(`
          id,
          created_at,
          requester_email,
          requester_name,
          status,
          item_id,
          requester_id,
          last_status_change,
          read_by_requester
        `)
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch item details
      const requestsWithItems = await Promise.all(
        (data || []).map(async (req) => {
          const { data: itemData } = await supabase
            .from("items")
            .select("id, name, image, description, price, category, location, whatsapp_number")
            .eq("id", req.item_id)
            .single();

          return {
            ...req,
            items: itemData
          };
        })
      );

      setRequests(requestsWithItems);

      // Mark unread updates as read
      const unreadIds = requestsWithItems
        .filter(req => !req.read_by_requester && (req.status === 'approved' || req.status === 'rejected'))
        .map(req => req.id);

      if (unreadIds.length > 0) {
        await supabase
          .from("requests")
          .update({ read_by_requester: true })
          .in("id", unreadIds);
        
        // Refresh notifications
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
    if (processingId) return;

    const confirmMessages = {
      approved: "Approve this request? The user will be able to contact you via WhatsApp.",
      rejected: "Reject this request? The user won't be able to contact you.",
    };

    if (!window.confirm(confirmMessages[newStatus])) return;

    setProcessingId(requestId);

    try {
      const { error } = await supabase
        .from("requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) throw error;

      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
      ));

      alert(`✅ Request ${newStatus} successfully!`);
      refreshNotifications();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("❌ Failed to update request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Delete this request? This action cannot be undone.")) return;

    setProcessingId(requestId);

    try {
      const { error } = await supabase
        .from("requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      setRequests(requests.filter(req => req.id !== requestId));
      alert("✅ Request deleted successfully!");
      refreshNotifications();
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("❌ Failed to delete request");
    } finally {
      setProcessingId(null);
    }
  };

  const getPlaceholderImage = (id) => {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', 'fa709a', '43e97b'];
    const color = colors[(id || 0) % colors.length];
    return `https://via.placeholder.com/300x200/${color}/ffffff?text=Item`;
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(req => req.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading your requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-bell text-muted" style={{ fontSize: "5rem" }}></i>
        <h2 className="mt-4">No requests made yet</h2>
        <p className="text-muted lead">
          When you express interest in items, your requests will appear here.
        </p>
        <Link to="/products" className="btn btn-success btn-lg mt-3">
          Browse Items
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-bell-fill text-danger me-2"></i>
            My Request Status
          </h2>
          <p className="text-muted mb-0">
            Track status updates on items you're interested in
          </p>
        </div>
        <button 
          onClick={fetchRequests} 
          className="btn btn-outline-primary"
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      {/* Info Alert */}
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        These are items you've expressed interest in. Check their approval status here.
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm" style={{ borderLeft: "4px solid #003087" }}>
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold" style={{ color: "#003087" }}>{counts.all}</h3>
              <small className="text-muted">Total Requests</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm" style={{ borderLeft: "4px solid #ffc107" }}>
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-warning">{counts.pending}</h3>
              <small className="text-muted">Pending</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm" style={{ borderLeft: "4px solid #28a745" }}>
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-success">{counts.approved}</h3>
              <small className="text-muted">Approved</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card border-0 shadow-sm" style={{ borderLeft: "4px solid #dc3545" }}>
            <div className="card-body text-center">
              <h3 className="mb-0 fw-bold text-danger">{counts.rejected}</h3>
              <small className="text-muted">Rejected</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="btn-group mb-4 w-100 shadow-sm" role="group">
        <button
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setFilter('all')}
        >
          All ({counts.all})
        </button>
        <button
          className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
          onClick={() => setFilter('pending')}
        >
          <i className="bi bi-clock me-1"></i>
          Pending ({counts.pending})
        </button>
        <button
          className={`btn ${filter === 'approved' ? 'btn-success' : 'btn-outline-success'}`}
          onClick={() => setFilter('approved')}
        >
          <i className="bi bi-check-circle me-1"></i>
          Approved ({counts.approved})
        </button>
        <button
          className={`btn ${filter === 'rejected' ? 'btn-danger' : 'btn-outline-danger'}`}
          onClick={() => setFilter('rejected')}
        >
          <i className="bi bi-x-circle me-1"></i>
          Rejected ({counts.rejected})
        </button>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-filter-circle" style={{ fontSize: "3rem", color: "#ccc" }}></i>
          <p className="text-muted mt-3">No {filter} requests found.</p>
        </div>
      ) : (
        <div className="row">
          {filteredRequests.map((req) => (
            <div key={req.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100 shadow-sm border-0 position-relative">
                {/* Status Badge */}
                <div className="position-absolute top-0 end-0 m-2">
                  <span className={`badge ${
                    req.status === 'pending' ? 'bg-warning text-dark' :
                    req.status === 'approved' ? 'bg-success' :
                    'bg-danger'
                  }`}>
                    {req.status === 'pending' && <i className="bi bi-clock me-1"></i>}
                    {req.status === 'approved' && <i className="bi bi-check-circle me-1"></i>}
                    {req.status === 'rejected' && <i className="bi bi-x-circle me-1"></i>}
                    {req.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>

                <img
                  src={req.items?.image || getPlaceholderImage(req.items?.id)}
                  className="card-img-top"
                  alt={req.items?.name}
                  style={{ height: "200px", objectFit: "cover" }}
                  onError={(e) => { e.target.src = getPlaceholderImage(req.items?.id); }}
                />

                <div className="card-body d-flex flex-column">
                  <h5 className="fw-bold mb-2" style={{ color: "#003087" }}>
                    {req.items?.name}
                  </h5>

                  {req.items?.price !== undefined && (
                    <p className="mb-2">
                      <span className="badge bg-success">
                        {req.items.price === 0 ? "FREE" : `${req.items.price} DKK`}
                      </span>
                      {req.items?.category && (
                        <span className="badge bg-info text-dark ms-2">
                          {req.items.category}
                        </span>
                      )}
                    </p>
                  )}

                  <p className="text-muted small mb-3">
                    {req.items?.description?.substring(0, 80)}...
                  </p>

                  {/* Request Info */}
                  <div className="bg-light p-3 rounded mb-3">
                    <p className="mb-1 small">
                      <strong>Requested:</strong> {new Date(req.created_at).toLocaleDateString()}
                    </p>
                    {req.status !== 'pending' && (
                      <p className="mb-0 small">
                        <strong>Status changed:</strong> {new Date(req.last_status_change || req.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Status Messages */}
                  {req.status === 'approved' && (
                    <div className="alert alert-success py-2 mb-3">
                      <small>
                        <i className="bi bi-check-circle me-1"></i>
                        <strong>Approved!</strong> You can contact the owner via WhatsApp.
                      </small>
                    </div>
                  )}

                  {req.status === 'rejected' && (
                    <div className="alert alert-danger py-2 mb-3">
                      <small>
                        <i className="bi bi-x-circle me-1"></i>
                        <strong>Request declined.</strong> The owner didn't approve this time.
                      </small>
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="alert alert-warning py-2 mb-3">
                      <small>
                        <i className="bi bi-clock me-1"></i>
                        <strong>Awaiting approval.</strong> The owner will review your request soon.
                      </small>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto">
                    <div className="d-grid gap-2">
                      <Link
                        to={`/product/${req.items?.id}`}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Item Details
                      </Link>

                      {req.status === 'approved' && req.items?.whatsapp_number && (
                        <a
                          href={`https://wa.me/${req.items.whatsapp_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-success btn-sm"
                        >
                          <i className="bi bi-whatsapp me-1"></i>
                          Contact Owner
                        </a>
                      )}

                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="btn btn-outline-danger btn-sm"
                        disabled={processingId === req.id}
                      >
                        {processingId === req.id ? (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : (
                          <i className="bi bi-trash me-1"></i>
                        )}
                        Cancel Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-5 p-4 bg-light rounded border-start border-danger border-4">
        <h5 className="mb-3" style={{ color: "#dc3545" }}>
          <i className="bi bi-info-circle me-2"></i>
          Understanding Request Status
        </h5>
        <div className="row">
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">⏳ Pending</h6>
            <small className="text-muted">
              Your request is waiting for the owner's review. Be patient!
            </small>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">✅ Approved</h6>
            <small className="text-muted">
              Great news! The owner approved your request. You can now contact them via WhatsApp.
            </small>
          </div>
          <div className="col-md-4 mb-3">
            <h6 className="fw-bold">❌ Rejected</h6>
            <small className="text-muted">
              The owner declined this time. Don't worry, there are many other items to explore!
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Requests;