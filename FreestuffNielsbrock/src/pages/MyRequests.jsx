import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

function MyRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshNotifications, markAllIncomingAsRead } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  // Mark all as read when component mounts
  useEffect(() => {
    if (user) {
      markAllIncomingAsRead();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all items posted by current user
      const { data: userItems, error: itemsError } = await supabase
        .from("items")
        .select("id")
        .eq("posted_by", user.id);

      if (itemsError) throw itemsError;

      const itemIds = userItems?.map(item => item.id) || [];

      if (itemIds.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      // Fetch requests for those items
      const { data, error: fetchError } = await supabase
        .from("requests")
        .select(`
          *,
          items (
            id,
            name,
            image,
            category,
            price,
            created_at,
            whatsapp_number
          )
        `)
        .in("item_id", itemIds)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        throw fetchError;
      }

      console.log("Requests fetched:", data);
      setRequests(data || []);

      // Mark all as read (for poster)
      if (data && data.length > 0) {
        const unreadIds = data.filter(req => !req.read_by_poster).map(req => req.id);
        if (unreadIds.length > 0) {
          await supabase
            .from("requests")
            .update({ read_by_poster: true })
            .in("id", unreadIds);
          
          // Refresh notifications context
          refreshNotifications();
        }
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError("Failed to load requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Remove this person's interest?")) return;

    try {
      const { error } = await supabase
        .from("requests")
        .delete()
        .eq("id", requestId);

      if (error) throw error;

      setRequests(prev => prev.filter(req => req.id !== requestId));
      alert("✅ Request removed");
      refreshNotifications();
    } catch (err) {
      console.error("Error deleting request:", err);
      alert("❌ Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5 text-center">
        <i className="bi bi-exclamation-circle" style={{ fontSize: "4rem", color: "#dc3545" }}></i>
        <h3 className="mt-3">Error</h3>
        <p className="text-danger">{error}</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/products")}>
          Back to Items
        </button>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-inbox text-muted" style={{ fontSize: "5rem" }}></i>
        <h2 className="mt-4">No requests yet</h2>
        <p className="text-muted lead">
          When someone marks your items as interested, they'll appear here.
        </p>
        <button className="btn btn-success btn-lg mt-3" onClick={() => navigate("/post")}>
          <i className="bi bi-plus-circle me-2"></i>
          Post an Item
        </button>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-inbox-fill text-success me-2"></i>
          Incoming Requests ({requests.length})
        </h2>
        <button 
          className="btn btn-outline-primary"
          onClick={fetchRequests}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        These are people interested in your items. You can contact them or manage their requests here.
      </div>

      <div className="row">
        {requests.map((req) => (
          <div key={req.id} className="col-lg-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="row g-0">
                {/* Item Image */}
                <div className="col-md-4">
                  <img
                    src={req.items?.image || `https://via.placeholder.com/200x200?text=${encodeURIComponent(req.items?.name || "Item")}`}
                    className="img-fluid rounded-start"
                    alt={req.items?.name}
                    style={{ height: "200px", objectFit: "cover" }}
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/200x200?text=${encodeURIComponent(req.items?.name || "Item")}`;
                    }}
                  />
                </div>

                {/* Item & User Info */}
                <div className="col-md-8">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title mb-0">{req.items?.name}</h5>
                      <span className={`badge ${
                        req.status === 'pending' ? 'bg-warning text-dark' :
                        req.status === 'approved' ? 'bg-success' :
                        'bg-danger'
                      }`}>
                        {req.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-muted small mb-2">
                      <i className="bi bi-tag me-1"></i>
                      {req.items?.category || "General"}
                    </p>
                    <p className="text-muted small mb-2">
                      <i className="bi bi-cash me-1"></i>
                      {req.items?.price === 0 ? "FREE" : `${req.items?.price} DKK`}
                    </p>
                    
                    <hr />

                    {/* Interested User Info */}
                    <h6 className="mb-3">Interested Student:</h6>
                    <div className="mb-3">
                      <p className="mb-1">
                        <strong>
                          <i className="bi bi-person-circle me-2"></i>
                          {req.requester_name || "Anonymous"}
                        </strong>
                      </p>
                      <p className="mb-1 small text-muted">
                        <i className="bi bi-envelope me-1"></i>
                        {req.requester_email}
                      </p>
                      <small className="text-muted">
                        <i className="bi bi-calendar me-1"></i>
                        Interested on: {new Date(req.created_at).toLocaleDateString()}
                      </small>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => navigate(`/product/${req.item_id}`)}
                        className="btn btn-sm btn-outline-primary flex-grow-1"
                      >
                        View Item
                      </button>
                      <a
                        href={`mailto:${req.requester_email}?subject=Regarding: ${req.items?.name}`}
                        className="btn btn-sm btn-outline-success"
                        title="Send email"
                      >
                        <i className="bi bi-envelope"></i>
                      </a>
                      <button
                        onClick={() => handleDeleteRequest(req.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Remove this request"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .card {
          transition: transform 0.2s, box-shadow 0.2s;
          border: none;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}

export default MyRequests;