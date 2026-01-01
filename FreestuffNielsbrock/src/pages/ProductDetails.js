import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { supabase } from "../supabase";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInterested, addToInterested, removeFromInterested } = useContext(CartContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'approved', 'rejected', or null

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        setError("Item not found");
        return;
      }

      if (data) {
        setProduct(data);
      } else {
        setError("Item not found");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load item");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch request status for current user
  const fetchRequestStatus = useCallback(async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from("requests")
        .select("status")
        .eq("item_id", id)
        .eq("requester_id", user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error fetching request status:", error);
        return;
      }

      if (data) {
        setRequestStatus(data.status);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, [id, user]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    fetchRequestStatus();
  }, [fetchRequestStatus]);

  const getPlaceholderImage = (productId) => {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', 'fa709a', '43e97b'];
    const color = colors[productId % colors.length];
    return `https://via.placeholder.com/600x400/${color}/ffffff?text=Item`;
  };

  const handleInterested = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      if (isInterested(product.id)) {
        // Remove from interested
        removeFromInterested(product.id);
        
        // Delete from database
        await supabase
          .from("requests")
          .delete()
          .eq("item_id", product.id)
          .eq("requester_id", user.id);

        setRequestStatus(null);
        alert("✅ Request removed successfully!");
      } else {
        // Add to interested
        addToInterested(product);
        
        // Save to database with 'pending' status
        const { error: insertError } = await supabase
          .from("requests")
          .insert([{
            item_id: product.id,
            requester_id: user.id,
            requester_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Anonymous",
            requester_email: user.email,
            status: 'pending' // Default status
          }]);

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }

        setRequestStatus('pending');
        alert("✅ Interest request sent! Wait for the poster to approve.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error: " + error.message);
    }
  };

  const handleWhatsAppMessage = () => {
    if (!product?.whatsapp_number) {
      alert("This poster hasn't provided a WhatsApp number");
      return;
    }

    const message = `Hi! I'm interested in your "${product.name}" from Free Stuff Niels Brock! Is it still available? 📦\nLocation: ${product.location || "TBD"}\n\nThanks!`;
    const whatsappUrl = `https://wa.me/${product.whatsapp_number.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Check if user can contact (either they're the owner OR their request is approved)
  const canContact = () => {
    if (!user) return false;
    if (product.posted_by === user.id) return true; // Owner can always see
    return requestStatus === 'approved';
  };

  if (loading) {
    return (
      <div className="container my-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading item details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container my-5 text-center">
        <i className="bi bi-exclamation-circle" style={{ fontSize: "4rem", color: "#ccc" }}></i>
        <h3 className="mt-3">{error || "Item not found"}</h3>
        <button className="btn btn-primary mt-3" onClick={() => navigate("/products")}>
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <button 
        className="btn btn-link mb-3 text-decoration-none" 
        onClick={() => navigate("/products")}
        style={{ color: "#003087" }}
      >
        <i className="bi bi-arrow-left me-2"></i>
        Back to Items
      </button>

      <div className="row">
        {/* Image */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-lg border-0">
            <img
              src={product.image || getPlaceholderImage(product.id)}
              className="card-img-top rounded"
              alt={product.name}
              style={{ height: "450px", objectFit: "cover" }}
              onError={(e) => { e.target.src = getPlaceholderImage(product.id); }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="col-md-6">
          <div className="card shadow-lg border-0 p-4">
            <h1 className="display-6 fw-bold mb-3" style={{ color: "#003087" }}>
              {product.name}
            </h1>

            <div className="mb-3">
              <span className="h2 text-success fw-bold">
                {product.price === 0 ? "FREE" : `${product.price} DKK`}
              </span>
              <span className="badge bg-info fs-6 ms-3">{product.category || "General"}</span>
              {product.condition && (
                <span className="badge bg-secondary fs-6 ms-2">Condition: {product.condition}</span>
              )}
            </div>

            <p className="lead text-muted mb-4">{product.description}</p>

            {product.location && (
              <div className="d-flex align-items-center mb-3 text-muted">
                <i className="bi bi-geo-alt-fill me-2" style={{ color: "#00A9E0" }}></i>
                <strong>Pickup:</strong> {product.location}
              </div>
            )}

            {product.posted_by_name && (
              <p className="text-muted small mb-2">
                <i className="bi bi-person-circle me-1"></i>
                {product.posted_by === user?.id ? (
                  <span>{product.posted_by_name}</span>
                ) : (
                  <Link 
                    to={`/user/${product.posted_by}`}
                    className="text-decoration-none"
                    style={{ color: "#003087", fontWeight: "500" }}
                    onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                    onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                  >
                    {product.posted_by_name}
                  </Link>
                )}
              </p>
            )}

            {product.created_at && (
              <small className="text-muted">
                <i className="bi bi-calendar me-2"></i>
                Posted: {new Date(product.created_at).toLocaleDateString()}
              </small>
            )}

            <hr className="my-4" />

            {/* Action Buttons */}
            <div className="d-grid gap-3">
              {user ? (
                <>
                  {/* Show request status */}
                  {requestStatus && product.posted_by !== user.id && (
                    <div className={`alert ${
                      requestStatus === 'pending' ? 'alert-warning' :
                      requestStatus === 'approved' ? 'alert-success' :
                      'alert-danger'
                    } mb-3`} role="alert">
                      <i className={`bi ${
                        requestStatus === 'pending' ? 'bi-clock' :
                        requestStatus === 'approved' ? 'bi-check-circle' :
                        'bi-x-circle'
                      } me-2`}></i>
                      <strong>
                        {requestStatus === 'pending' && 'Request Pending'}
                        {requestStatus === 'approved' && 'Request Approved!'}
                        {requestStatus === 'rejected' && 'Request Rejected'}
                      </strong>
                      <br />
                      <small>
                        {requestStatus === 'pending' && 'Waiting for poster approval to contact them.'}
                        {requestStatus === 'approved' && 'You can now message the poster on WhatsApp!'}
                        {requestStatus === 'rejected' && 'The poster declined your request.'}
                      </small>
                    </div>
                  )}

                  {/* WhatsApp button - only show if approved or owner */}
                  {canContact() && (
                    <button
                      onClick={handleWhatsAppMessage}
                      className="btn btn-success btn-lg fw-bold shadow"
                      style={{ backgroundColor: "#25D366", border: "none" }}
                    >
                      <i className="bi bi-whatsapp me-2"></i>
                      Message on WhatsApp
                    </button>
                  )}

                  {/* Interest button - hide if user is the owner */}
                  {product.posted_by !== user.id && (
                    <button
                      onClick={handleInterested}
                      className={`btn btn-lg fw-bold shadow ${isInterested(product.id) ? "btn-danger" : "btn-outline-primary"}`}
                      disabled={requestStatus === 'rejected'}
                    >
                      <i className={`bi ${isInterested(product.id) ? "bi-heart-fill" : "bi-heart"} me-2`}></i>
                      {isInterested(product.id) ? "Remove Interest Request" : "I'm Interested"}
                    </button>
                  )}

                  {/* Info message if not approved yet */}
                  {!canContact() && product.posted_by !== user.id && !requestStatus && (
                    <div className="alert alert-info" role="alert">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>How it works:</strong>
                      <br />
                      <small>1. Click "I'm Interested" to send a request</small><br />
                      <small>2. Wait for poster approval</small><br />
                      <small>3. Once approved, you can message them on WhatsApp</small>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="alert alert-info" role="alert">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Login required</strong> to express interest and contact posters
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn btn-primary btn-lg fw-bold shadow"
                  >
                    <i className="bi bi-door-open me-2"></i>
                    Login to Get Started
                  </button>
                </>
              )}

              <button
                onClick={() => navigate("/products")}
                className="btn btn-outline-secondary"
              >
                Back to Items
              </button>
            </div>

            <div className="mt-4 p-3 bg-light rounded border-start border-primary border-4">
              <small className="text-muted">
                <i className="bi bi-shield-check me-2" style={{ color: "#003087" }}></i>
                <strong>Safety Tip:</strong> Always meet in public areas on campus (library, canteen, etc.)
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Items */}
      <div className="mt-5 p-4 bg-light rounded">
        <h4 style={{ color: "#003087" }}>Looking for more?</h4>
        <p className="text-muted">
          Check out other free items in <strong>{product.category}</strong> category!
        </p>
        <a href="/products" className="btn btn-outline-primary">
          Browse All Items <i className="bi bi-arrow-right ms-2"></i>
        </a>
      </div>
    </div>
  );
}

export default ProductDetails;