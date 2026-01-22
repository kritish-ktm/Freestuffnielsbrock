import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { supabase } from "../supabase";
import ReportButton from "../components/ReportButton"; // ✅ FIX: default import

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInterested, addToInterested, removeFromInterested } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

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
        setProduct(null);
        return;
      }

      setProduct(data || null);
      if (!data) setError("Item not found");
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load item");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRequestStatus = useCallback(async () => {
    if (!user || !id) {
      setRequestStatus(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("requests")
        .select("status")
        .eq("item_id", id)
        .eq("requester_id", user.id)
        .maybeSingle(); // ✅ better than .single() (no error when not found)

      if (error) {
        console.error("Error fetching request status:", error);
        return;
      }

      setRequestStatus(data?.status ?? null);
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
    const colors = ["667eea", "764ba2", "f093fb", "4facfe", "fa709a", "43e97b"];
    const safeId = Number(productId) || 0;
    const color = colors[safeId % colors.length];
    return `https://via.placeholder.com/600x400/${color}/ffffff?text=Item`;
  };

  const canContact = () => {
    if (!user || !product) return false;
    if (product.posted_by === user.id) return true;
    return requestStatus === "approved" || requestStatus === "accepted";
  };

  const handleInterested = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!product) return;

    try {
      if (isInterested(product.id)) {
        removeFromInterested(product.id);

        const { error: deleteError } = await supabase
          .from("requests")
          .delete()
          .eq("item_id", product.id)
          .eq("requester_id", user.id);

        if (deleteError) throw deleteError;

        setRequestStatus(null);
        alert("✅ Request removed successfully!");
      } else {
        addToInterested(product);

        const { error: insertError } = await supabase.from("requests").insert([
          {
            item_id: product.id,
            requester_id: user.id,
            requester_name:
              user.user_metadata?.full_name || user.email?.split("@")[0] || "Anonymous",
            requester_email: user.email,
            status: "pending",
          },
        ]);

        if (insertError) throw insertError;

        setRequestStatus("pending");
        alert("✅ Interest request sent! Wait for the poster to approve.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error: " + (err?.message || "Something went wrong"));
    }
  };

  const handleWhatsAppMessage = () => {
    if (!product?.whatsapp_number) {
      alert("This poster hasn't provided a WhatsApp number");
      return;
    }

    const message =
      `Hi! I'm interested in your "${product.name}" from Free Stuff Niels Brock! Is it still available? 📦\n` +
      `Location: ${product.location || "TBD"}\n\nThanks!`;

    const whatsappUrl = `https://wa.me/${String(product.whatsapp_number).replace(
      /\s+/g,
      ""
    )}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
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
        <i className="bi bi-exclamation-circle" style={{ fontSize: "4rem", color: "#ccc" }} />
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
        <i className="bi bi-arrow-left me-2" />
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
              onError={(e) => {
                e.currentTarget.src = getPlaceholderImage(product.id);
              }}
            />
          </div>
        </div>

        {/* Details */}
        <div className="col-md-6">
          <div className="card shadow-lg border-0 p-4">
            {/* Title with Report Button */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <h1 className="display-6 fw-bold" style={{ color: "#003087" }}>
                {product.name}
              </h1>

              {/* ✅ Report Button - show if logged in and not owner */}
              {user && product.posted_by !== user.id && (
                <ReportButton itemId={product.id} itemTitle={product.name} />
              )}
            </div>

            <div className="mb-3">
              <span className="h2 text-success fw-bold">
                {Number(product.price) === 0 ? "FREE" : `${product.price} DKK`}
              </span>
              <span className="badge bg-info fs-6 ms-3">{product.category || "General"}</span>
              {product.condition && (
                <span className="badge bg-secondary fs-6 ms-2">
                  Condition: {product.condition}
                </span>
              )}
            </div>

            <p className="lead text-muted mb-4">{product.description}</p>

            {product.location && (
              <div className="d-flex align-items-center mb-3 text-muted">
                <i className="bi bi-geo-alt-fill me-2" style={{ color: "#00A9E0" }} />
                <strong className="me-2">Pickup:</strong> {product.location}
              </div>
            )}

            {product.posted_by_name && (
              <p className="text-muted small mb-2">
                <i className="bi bi-person-circle me-1" />
                {product.posted_by === user?.id ? (
                  <span>{product.posted_by_name}</span>
                ) : (
                  <Link
                    to={`/user/${product.posted_by}`}
                    className="text-decoration-none"
                    style={{ color: "#003087", fontWeight: "500" }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    {product.posted_by_name}
                  </Link>
                )}
              </p>
            )}

            {product.created_at && (
              <small className="text-muted">
                <i className="bi bi-calendar me-2" />
                Posted: {new Date(product.created_at).toLocaleDateString()}
              </small>
            )}

            <hr className="my-4" />

            {/* Action Buttons */}
            <div className="d-grid gap-3">
  {user ? (
    <>
      {/* EDIT BUTTON - Only show if user is the owner */}
      {product.posted_by === user.id && (
        <button
          onClick={() => navigate(`/edit-item/${product.id}`)}
          className="btn btn-warning btn-lg fw-bold shadow"
        >
          <i className="bi bi-pencil-square me-2"></i>
          Edit This Item
        </button>
      )}

      {requestStatus && product.posted_by !== user.id && (
        <div
          className={`alert ${
            requestStatus === "pending"
              ? "alert-warning"
              : requestStatus === "approved" || requestStatus === "accepted"
              ? "alert-success"
              : "alert-danger"
          } mb-3`}
          role="alert"
        >
                      <i
                        className={`bi ${
                          requestStatus === "pending"
                            ? "bi-clock"
                            : requestStatus === "approved" || requestStatus === "accepted"
                            ? "bi-check-circle"
                            : "bi-x-circle"
                        } me-2`}
                      />
                      <strong>
                        {requestStatus === "pending" && "Request Pending"}
                        {(requestStatus === "approved" || requestStatus === "accepted") &&
                          "Request Approved!"}
                        {requestStatus === "rejected" && "Request Rejected"}
                      </strong>
                      <br />
                      <small>
                        {requestStatus === "pending" &&
                          "Waiting for poster approval to contact them."}
                        {(requestStatus === "approved" || requestStatus === "accepted") &&
                          "You can now message the poster on WhatsApp!"}
                        {requestStatus === "rejected" && "The poster declined your request."}
                      </small>
                    </div>
                  )}

                  {canContact() && (
                    <button
                      onClick={handleWhatsAppMessage}
                      className="btn btn-success btn-lg fw-bold shadow"
                      style={{ backgroundColor: "#25D366", border: "none" }}
                    >
                      <i className="bi bi-whatsapp me-2" />
                      Message on WhatsApp
                    </button>
                  )}

                  {product.posted_by !== user.id && (
                    <button
                      onClick={handleInterested}
                      className={`btn btn-lg fw-bold shadow ${
                        isInterested(product.id) ? "btn-danger" : "btn-outline-primary"
                      }`}
                      disabled={requestStatus === "rejected"}
                    >
                      <i
                        className={`bi ${
                          isInterested(product.id) ? "bi-heart-fill" : "bi-heart"
                        } me-2`}
                      />
                      {isInterested(product.id) ? "Remove Interest Request" : "I'm Interested"}
                    </button>
                  )}

                  {!canContact() && product.posted_by !== user.id && !requestStatus && (
                    <div className="alert alert-info" role="alert">
                      <i className="bi bi-info-circle me-2" />
                      <strong>How it works:</strong>
                      <br />
                      <small>1. Click "I'm Interested" to send a request</small>
                      <br />
                      <small>2. Wait for poster approval</small>
                      <br />
                      <small>3. Once approved, you can message them on WhatsApp</small>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="alert alert-info" role="alert">
                    <i className="bi bi-info-circle me-2" />
                    <strong>Login required</strong> to express interest and contact posters
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="btn btn-primary btn-lg fw-bold shadow"
                  >
                    <i className="bi bi-door-open me-2" />
                    Login to Get Started
                  </button>
                </>
              )}

              <button onClick={() => navigate("/products")} className="btn btn-outline-secondary">
                Back to Items
              </button>
            </div>

            <div className="mt-4 p-3 bg-light rounded border-start border-primary border-4">
              <small className="text-muted">
                <i className="bi bi-shield-check me-2" style={{ color: "#003087" }} />
                <strong>Safety Tip:</strong> Always meet in public areas on campus (library, canteen,
                etc.)
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
          Browse All Items <i className="bi bi-arrow-right ms-2" />
        </a>
      </div>
    </div>
  );
}

export default ProductDetails;
