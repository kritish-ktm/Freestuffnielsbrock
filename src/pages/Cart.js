import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { supabase } from "../supabase";

function Cart() {
  const { user } = useAuth();
  const { removeFromInterested, clearInterested } = useContext(CartContext);
  const [dbInterestedItems, setDbInterestedItems] = useState([]);
  const [loadingInterested, setLoadingInterested] = useState(false);

  useEffect(() => {
    const fetchInterestedItems = async () => {
      if (!user) {
        setDbInterestedItems([]);
        return;
      }

      try {
        setLoadingInterested(true);
        // Fetch requests WHERE CURRENT USER IS THE REQUESTER
        const { data, error } = await supabase
          .from("requests")
          .select(`
            *,
            items (*)
          `)
          .eq("requester_id", user.id);

        if (error) throw error;

        // Extract items from requests
        const items = data?.map(req => req.items).filter(Boolean) || [];
        setDbInterestedItems(items);
      } catch (error) {
        console.error("Error fetching interested items:", error);
      } finally {
        setLoadingInterested(false);
      }
    };

    fetchInterestedItems();
  }, [user]);

  const getPlaceholderImage = (id) => {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', 'fa709a', '43e97b'];
    const color = colors[id % colors.length];
    return `https://via.placeholder.com/200x150/${color}/ffffff?text=Item`;
  };

  const handleRemoveInterested = async (itemId) => {
    try {
      removeFromInterested(itemId);
      
      // Delete from database
      if (user) {
        await supabase
          .from("requests")
          .delete()
          .eq("item_id", itemId)
          .eq("requester_id", user.id);
        
        // Refresh the list
        setDbInterestedItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error("Error removing interested item:", error);
    }
  };

  return (
    <div className="container my-5">
      <h1 className="mb-4">
        <i className="bi bi-heart me-2"></i>
        My Interested Items
      </h1>

      {/* My Interested Items - ONLY FOR REQUESTERS */}
      <div>
        {loadingInterested ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : dbInterestedItems.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <i className="bi bi-heart" style={{ fontSize: "3rem" }}></i>
            <p className="mt-3">You haven't marked any items as interested yet.</p>
            <Link to="/products" className="btn btn-primary mt-3">
              <i className="bi bi-shop me-2"></i>
              Browse Items
            </Link>
          </div>
        ) : (
          <>
            <div className="row">
              {dbInterestedItems.map((item) => (
                <div key={item.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 shadow-sm interested-card">
                    <img
                      src={item.image || getPlaceholderImage(item.id)}
                      className="card-img-top"
                      alt={item.name}
                      style={{ height: "180px", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = getPlaceholderImage(item.id);
                      }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text text-muted small flex-grow-1">
                        {item.description?.substring(0, 100)}...
                      </p>

                      <div className="mb-2">
                        <span className="badge bg-success me-2">
                          {item.price === 0 ? "FREE" : `${item.price} DKK`}
                        </span>
                        <span className="badge bg-info text-dark">
                          {item.category || "General"}
                        </span>
                      </div>

                      {item.posted_by_name && (
                        <div className="p-2 bg-light rounded mb-2">
                          <p className="text-muted small mb-0">
                            <i className="bi bi-person-circle me-1"></i>
                            Posted by: <strong>{item.posted_by_name}</strong>
                          </p>
                        </div>
                      )}

                      {item.location && (
                        <p className="text-muted small mb-2">
                          <i className="bi bi-geo-alt me-1"></i>
                          {item.location}
                        </p>
                      )}

                      <div className="d-flex gap-2 mt-auto">
                        <Link
                          to={`/product/${item.id}`}
                          className="btn btn-primary btn-sm flex-grow-1"
                        >
                          <i className="bi bi-eye me-1"></i>
                          View
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveInterested(item.id)}
                          title="Remove from interested"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="btn btn-outline-danger mt-4" 
              onClick={() => {
                clearInterested();
                setDbInterestedItems([]);
              }}
            >
              <i className="bi bi-trash me-2"></i>
              Clear All Interested Items
            </button>
          </>
        )}
      </div>

      <style jsx>{`
        .interested-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }

        .interested-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}

export default Cart;