// src/pages/ProductList.js
import React, { useState, useEffect, useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { supabase } from "../supabase";

function ProductList() {
  const { user } = useAuth();
  const { removeFromInterested, isInterested } = useContext(CartContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Get search query from URL on mount and when URL changes
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Fetch items from Supabase
  useEffect(() => {
    fetchItems();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('items-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' },
        (payload) => {
          console.log('Change detected:', payload);
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Fetched items:', data);
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert('Failed to load items: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
      alert('Item deleted successfully!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item: ' + error.message);
    }
  };

  // Clear filters and URL params
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSearchParams({}); // Clear URL search params
  };

  // Generate placeholder image
  const getPlaceholderImage = (id) => {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', 'fa709a', '43e97b'];
    const color = colors[id % colors.length];
    return `https://via.placeholder.com/300x200/${color}/ffffff?text=Item`;
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading items...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1 className="text-center mb-4">Browse Free Items</h1>

      {/* Search & Filter */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select
            className="form-select form-select-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="General">General</option>
            <option value="Books">Books</option>
            <option value="Electronics">Electronics</option>
            <option value="Furniture">Furniture</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary btn-lg w-100"
            onClick={handleClearFilters}
          >
            Clear
          </button>
        </div>
      </div>

      <p className="text-muted text-center">
        {filteredProducts.length} item{filteredProducts.length !== 1 ? "s" : ""} found
      </p>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-5">
          <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
          <p className="mt-3 text-muted">
            {searchTerm || selectedCategory !== "All" 
              ? "No items match your search. Try different filters."
              : "No items posted yet. Be the first to share!"}
          </p>
          {user && (
            <Link to="/post" className="btn btn-success btn-lg mt-3">
              <i className="bi bi-plus-circle me-2"></i>
              Post Item
            </Link>
          )}
        </div>
      ) : (
        <div className="row g-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
              <div className="card h-100 shadow-sm product-card">
                <img
                  src={product.image || getPlaceholderImage(product.id)}
                  className="card-img-top"
                  alt={product.name}
                  style={{ height: "150px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.src = getPlaceholderImage(product.id);
                  }}
                />
                <div className="card-body d-flex flex-column p-3">
                  <h6 className="card-title">{product.name}</h6>
                  <p className="card-text text-muted flex-grow-1" style={{ fontSize: "0.85rem" }}>
                    {product.description?.substring(0, 50) || "No description"}...
                  </p>
                  
                  {product.condition && (
                    <p className="text-muted small mb-2">
                      <i className="bi bi-star me-1"></i>
                      {product.condition}
                    </p>
                  )}

                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="h6 mb-0 text-success">
                        {product.price === 0 ? "FREE" : `${product.price} DKK`}
                      </span>
                      <span className="badge bg-info text-dark" style={{ fontSize: "0.75rem" }}>
                        {product.category || "General"}
                      </span>
                    </div>

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

                    {product.location && (
                      <p className="text-muted small mb-3">
                        <i className="bi bi-geo-alt me-1"></i>
                        {product.location}
                      </p>
                    )}

                    <Link
                      to={`/product/${product.id}`}
                      className="btn btn-outline-primary btn-sm w-100 mb-2"
                    >
                      View Details
                    </Link>

                    {user && product.posted_by === user.id && (
                      <button
                        className="btn btn-danger btn-sm w-100"
                        onClick={() => handleDelete(product.id)}
                      >
                        <i className="bi bi-trash me-1"></i>
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .product-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: none;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2) !important;
        }
        
        .card-img-wrapper {
          overflow: hidden;
          background: #f0f0f0;
        }
        
        .product-card .card-img-top {
          transition: transform 0.3s ease;
          width: 100%;
        }
        
        .product-card:hover .card-img-top {
          transform: scale(1.1);
        }

        .product-card .card-body {
          background: white;
        }

        .product-card .badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.4rem 0.6rem;
        }

        .product-card .btn {
          transition: all 0.2s ease;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .product-card .btn:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}

export default ProductList;