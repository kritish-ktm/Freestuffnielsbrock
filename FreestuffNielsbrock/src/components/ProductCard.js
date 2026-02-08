// src/components/ProductCard.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";
import ReportButton from "./ReportButton";

function ProductCard({ product }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });

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

  // Show toast notification
  const showNotification = (type, text) => {
    setToastMessage({ type, text });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle interest request
  const handleRequest = async () => {
    if (!user) {
      showNotification('warning', 'Please log in to request this item');
      return;
    }

    try {
      setLoading(true);

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
          showNotification('info', 'You already requested this item');
        } else {
          throw error;
        }
      } else {
        showNotification('success', 'Request sent successfully!');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card h-100 shadow-sm position-relative">
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
              <i className="bi bi-clock-history me-1"></i>
              Expires in {daysUntilExpiry} {daysUntilExpiry === 1 ? 'day' : 'days'}
            </div>
          )}

          {/* Expired Badge */}
          {daysUntilExpiry !== null && daysUntilExpiry <= 0 && (
            <div className="alert alert-danger py-1 px-2 mb-2" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-exclamation-triangle me-1"></i>
              Expired
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-auto">
            <button
              className="btn btn-outline-primary w-100 mb-2"
              onClick={handleRequest}
              disabled={loading || (daysUntilExpiry !== null && daysUntilExpiry <= 0)}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Requesting...
                </>
              ) : (
                <>
                  <i className="bi bi-hand-thumbs-up me-2"></i>
                  I'm Interested
                </>
              )}
            </button>

            {/* Report Button */}
            <div className="d-flex justify-content-center">
              <ReportButton 
                itemId={product.id} 
                itemTitle={product.name || product.title} 
              />
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div 
            className="position-absolute top-50 start-50 translate-middle"
            style={{ 
              zIndex: 1050,
              animation: 'fadeInScale 0.3s ease-out',
              width: '90%',
              maxWidth: '300px'
            }}
          >
            <div 
              className={`alert alert-${
                toastMessage.type === 'success' ? 'success' : 
                toastMessage.type === 'error' ? 'danger' : 
                toastMessage.type === 'warning' ? 'warning' : 
                'info'
              } d-flex align-items-center shadow-lg mb-0`}
              role="alert"
              style={{
                borderRadius: '10px',
                border: 'none'
              }}
            >
              <i className={`bi ${
                toastMessage.type === 'success' ? 'bi-check-circle-fill' : 
                toastMessage.type === 'error' ? 'bi-x-circle-fill' : 
                toastMessage.type === 'warning' ? 'bi-exclamation-triangle-fill' : 
                'bi-info-circle-fill'
              } me-2`} style={{ fontSize: '1.5rem' }}></i>
              <div>{toastMessage.text}</div>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}

export default ProductCard;
