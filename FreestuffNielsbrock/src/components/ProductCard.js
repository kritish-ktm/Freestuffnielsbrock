// ProductCard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function ProductCard({ product }) {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const handleRequest = async () => {
    if (!user) {
      setMessage("⚠️ Please log in to request this item.");
      return;
    }

    try {
      setLoading(true);
      setMessage("Sending request...");

      const { data, error } = await supabase
        .from("requests")
        .insert({
          item_id: product.id, // make sure your items.id is UUID
          requester_id: user.id,
          requester_email: user.email,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage("✅ Request sent!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to send request.");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="card h-100 shadow-sm">
      <img
        src={product.image || `https://via.placeholder.com/300x200?text=${product.name}`}
        className="card-img-top"
        alt={product.name}
        style={{ height: "200px", objectFit: "cover" }}
      />
      <div className="card-body d-flex flex-column">
        <h5>{product.name}</h5>
        <p className="text-muted small">{product.description?.substring(0, 80)}...</p>
        <div className="mt-auto">
          <button
            className="btn btn-outline-primary w-100"
            onClick={handleRequest}
            disabled={loading}
          >
            {loading ? "Requesting..." : "I'm Interested"}
          </button>
          {message && <small className="text-success d-block mt-1">{message}</small>}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
