import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

function MyRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch requests for items posted by THIS USER ONLY
        // Get all items posted by current user first
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

        // Now fetch requests for those items
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
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user, navigate]);

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
      <h2 className="mb-4">
        <i className="bi bi-heart-fill text-danger me-2"></i>
        Who's Interested in My Items ({requests.length})
      </h2>

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
                    <h5 className="card-title">{req.items?.name}</h5>
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