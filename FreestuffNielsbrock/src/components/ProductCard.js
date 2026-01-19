// src/components/ProductCard.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import ReportButton from "./ReportButton";

function ProductCard({ product }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate days until expiry
  const daysUntilExpiry = product.expiry_date 
    ? Math.floor((new Date(product.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 0 || price === '0') {
      return 'Free';
    }
    return `${parseFloat(price).toFixed(2)} DKK`;
  };

  // Handle interest request
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
          item_id: product.id,
          requester_id: user.id,
          requester_email: user.email,
          created_at: new Date().toISOString(),
        });

      if (error) {
        // Check for duplicate request
        if (error.code === '23505') {
          setMessage("ℹ️ You already requested this item.");
        } else {
          throw error;
        }
      } else {
        setMessage("✅ Request sent!");
      }
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
      {/* Product Image */}
      <div style={{ position: 'relative' }}>
        <img
          src={product.image || product.image_url || `https://via.placeholder.com/300x200?text=${encodeURIComponent(product.name || product.title)}`}
          className="card-img-top"
          alt={product.name || product.title}
          style={{ height: "200px", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        
        {/* Condition Badge (if exists) */}
        {product.condition && (
          <span 
            className="badge position-absolute top-0 start-0 m-2"
            style={{
              backgroundColor: 
                product.condition === 'new' ? '#28a745' :
                product.condition === 'like-new' ? '#17a2b8' :
                product.condition === 'used' ? '#ffc107' : '#6c757d',
              color: product.condition === 'used' ? '#000' : '#fff'
            }}
          >
            {product.condition}
          </span>
        )}

        {/* Price Badge */}
        <span 
          className="badge bg-success position-absolute top-0 end-0 m-2"
          style={{ fontSize: '0.9rem' }}
        >
          {formatPrice(product.price)}
        </span>
      </div>

      {/* Card Body */}
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name || product.title}</h5>
        
        {/* Category (if exists) */}
        {product.category && (
          <span className="badge bg-secondary mb-2 align-self-start">
            {product.category}
          </span>
        )}

        {/* Description */}
        <p className="text-muted small flex-grow-1">
          {(product.description || '').substring(0, 100)}
          {(product.description || '').length > 100 ? '...' : ''}
        </p>

        {/* Expiry Warning */}
        {daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
          <div 
            className="alert alert-warning py-1 px-2 mb-2" 
            style={{ fontSize: '0.85rem' }}
            role="alert"
          >
            ⏰ Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
          </div>
        )}

        {/* Expired Badge */}
        {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
          <div className="alert alert-danger py-1 px-2 mb-2" style={{ fontSize: '0.85rem' }}>
            ⚠️ Expired
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto">
          <button
            className="btn btn-outline-primary w-100 mb-2"
            onClick={handleRequest}
            disabled={loading || (daysUntilExpiry !== null && daysUntilExpiry <= 0)}
          >
            {loading ? "Requesting..." : "I'm Interested"}
          </button>
          
          {/* Message */}
          {message && (
            <small 
              className={`d-block text-center mb-2 ${
                message.includes('✅') ? 'text-success' : 
                message.includes('❌') ? 'text-danger' : 
                'text-info'
              }`}
            >
              {message}
            </small>
          )}

          {/* Report Button */}
          <div className="d-flex justify-content-center">
            <ReportButton 
              itemId={product.id} 
              itemTitle={product.name || product.title} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;