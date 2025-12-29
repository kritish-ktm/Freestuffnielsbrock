import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function AdminItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFlagged, setFilterFlagged] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchItems();
  }, [filterFlagged]);

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

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (filterFlagged) {
        query = query.eq("is_flagged", true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
      setMessage("Error loading items: " + error.message);
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleFlagItem = async (itemId, currentFlag) => {
    try {
      const { error } = await supabase
        .from("items")
        .update({ is_flagged: !currentFlag })
        .eq("id", itemId);

      if (error) throw error;

      setMessage(`✅ Item ${!currentFlag ? "flagged" : "unflagged"} successfully`);
      setMessageType("success");
      fetchItems();
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setMessageType("danger");
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

    try {
      const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setMessage("✅ Item deleted successfully");
      setMessageType("success");
      fetchItems();
    } catch (error) {
      setMessage("❌ Error: " + error.message);
      setMessageType("danger");
    }
  };

  const filteredItems = items.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <i className="bi bi-pencil-square me-2"></i>
            Admin - Item Moderation
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

        <div className="row g-3 mb-4">
          <div className="col-md-8">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <input
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Search by item name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="flaggedFilter"
                    checked={filterFlagged}
                    onChange={(e) => setFilterFlagged(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="flaggedFilter">
                    <i className="bi bi-flag-fill me-2 text-warning"></i>
                    Show Flagged Only
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm border-0 h-100">
                  {/* Item Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      className="card-img-top"
                      alt={item.name}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  )}

                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title">{item.name}</h5>
                      {item.is_flagged && (
                        <span className="badge bg-warning">
                          <i className="bi bi-flag-fill me-1"></i>Flagged
                        </span>
                      )}
                    </div>

                    <p className="card-text text-muted small">
                      {item.description?.substring(0, 80)}...
                    </p>

                    <div className="mb-3">
                      <small className="text-muted d-block mb-1">
                        <strong>Category:</strong> {item.category}
                      </small>
                      <small className="text-muted d-block mb-1">
                        <strong>Price:</strong> {item.price === 0 ? "FREE" : `${item.price} DKK`}
                      </small>
                      <small className="text-muted d-block">
                        <strong>Posted by:</strong> {item.posted_by_name}
                      </small>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-grid gap-2">
                      <button
                        className={`btn btn-sm ${item.is_flagged ? "btn-warning" : "btn-outline-warning"}`}
                        onClick={() => handleFlagItem(item.id, item.is_flagged)}
                      >
                        <i className={`bi ${item.is_flagged ? "bi-flag-fill" : "bi-flag"} me-1`}></i>
                        {item.is_flagged ? "Unflag" : "Flag Item"}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <i className="bi bi-trash me-1"></i>Delete Item
                      </button>
                    </div>
                  </div>

                  <div className="card-footer bg-light p-3 text-center">
                    <small className="text-muted">
                      Posted: {new Date(item.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i>
                <p className="mt-3 text-muted">No items found</p>
              </div>
            </div>
          )}
        </div>

        <div className="alert alert-info mt-4">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Total Items:</strong> {items.length} | <strong>Showing:</strong> {filteredItems.length}
        </div>
      </div>
    </div>
  );
}

export default AdminItems;