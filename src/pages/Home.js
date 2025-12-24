// src/pages/Home.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function Home() {
  const { user } = useAuth();
  const [latestItems, setLatestItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load last 6 items from Supabase
  useEffect(() => {
    fetchLatestItems();
  }, []);

  const fetchLatestItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      console.log('Latest items:', data);
      setLatestItems(data || []);
    } catch (error) {
      console.error('Error fetching latest items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleLiveDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLatestItems(latestItems.filter(item => item.id !== id));
      alert('Item deleted!');
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete: ' + error.message);
    }
  };

  // Generate placeholder image
  const getPlaceholderImage = (id) => {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', 'fa709a', '43e97b'];
    const color = colors[id % colors.length];
    return `https://via.placeholder.com/300x200/${color}/ffffff?text=Item`;
  };

  return (
    <div>
      <Header />

      {/* Beta Alert */}
      <div className="alert alert-warning text-center mb-0" role="alert" style={{ borderRadius: 0 }}>
        🚧 <strong>Beta Version:</strong> We're actively testing and improving the platform. Your feedback is welcome!
      </div>

      {/* Job Portal Announcement Banner */}
      <div className="alert alert-info text-center mb-0" role="alert" style={{ borderRadius: 0, backgroundColor: "#D4AF37", borderColor: "#D4AF37", color: "#fff" }}>
        💼 <strong>Coming Soon:</strong> Career Opportunities Platform - Connect with employers for internships, part-time positions, and job opportunities!
      </div>
{/* Disclaimer Banner */}
<div
  className="alert alert-info text-center mb-0"
  role="alert"
  style={{
    borderRadius: 0,
    backgroundColor: "#2E7D32",
borderColor: "#2E7D32",
color: "#ffffff",

    fontSize: "0.95rem",
  }}
>
  🎓 <strong>Student-Led Project:</strong> This platform is created by students for students and is not an official website or service of Niels Brock.
</div>


      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5" style={{ color: "#003087" }}>
            How It Works
          </h2>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "80px", height: "80px", backgroundColor: "#003087" }}
              >
                <i className="bi bi-upload" style={{ fontSize: "2rem" }}></i>
              </div>
              <h4 style={{ color: "#003087" }}>1. Post Your Item</h4>
              <p className="text-muted">
                List items you no longer need. It's quick, easy, and free!
              </p>
            </div>
            <div className="col-md-4 text-center">
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "80px", height: "80px", backgroundColor: "#00A9E0" }}
              >
                <i className="bi bi-search" style={{ fontSize: "2rem" }}></i>
              </div>
              <h4 style={{ color: "#003087" }}>2. Browse Items</h4>
              <p className="text-muted">
                Search through items posted by fellow students.
              </p>
            </div>
            <div className="col-md-4 text-center">
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "80px", height: "80px", backgroundColor: "#D4AF37" }}
              >
                <i className="bi bi-hand-thumbs-up" style={{ fontSize: "2rem" }}></i>
              </div>
              <h4 style={{ color: "#003087" }}>3. Pick It Up</h4>
              <p className="text-muted">
                Contact the poster and arrange a pickup. Simple as that!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Items Section */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: "#003087" }}>Latest Items</h2>
            <Link
              to="/products"
              className="btn btn-outline-primary border-2"
              style={{ borderColor: "#00A9E0", color: "#00A9E0" }}
            >
              View All Items <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : latestItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
              <p className="text-muted mt-3">No items yet. Be the first to post!</p>
              {user && (
                <Link to="/post" className="btn btn-success mt-3">
                  Post an Item
                </Link>
              )}
            </div>
          ) : (
            <div className="row g-3">
              {latestItems.map(product => (
                <div key={product.id} className="col-lg-4 col-md-4 col-sm-6 mb-4">
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
      // If it's the current user's item, just show the name
      <span>{product.posted_by_name}</span>
    ) : (
      // If it's someone else's item, make it clickable
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
                          className="btn btn-outline-primary btn-sm w-100"
                        >
                          View Details
                        </Link>

                        {user && product.posted_by === user.id && (
                          <button
                            className="btn btn-danger btn-sm w-100 mt-2"
                            onClick={() => handleLiveDelete(product.id)}
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
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5" style={{ color: "#003087" }}>
            Popular Categories
          </h2>
          <div className="row g-4">
            {[
              { name: "Books", icon: "bi-book", color: "#003087" },
              { name: "Electronics", icon: "bi-laptop", color: "#00A9E0" },
              { name: "Furniture", icon: "bi-house", color: "#003087" },
              { name: "Clothing", icon: "bi-bag", color: "#00A9E0" },
              { name: "Sports", icon: "bi-bicycle", color: "#003087" },
              { name: "Accessories", icon: "bi-backpack", color: "#00A9E0" },
            ].map((category) => (
              <div key={category.name} className="col-md-2 col-sm-4 col-6">
                <Link to="/products" className="text-decoration-none">
                  <div className="card h-100 text-center shadow-sm category-card border-0">
                    <div className="card-body">
                      <i className={`bi ${category.icon}`} style={{ fontSize: "3rem", color: category.color }}></i>
                      <h6 className="mt-3 mb-0" style={{ color: "#003087" }}>
                        {category.name}
                      </h6>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <h2 className="display-4 fw-bold" style={{ color: "#003087" }}>
                {latestItems.length > 0 ? `${latestItems.length * 10}+` : '0'}
              </h2>
              <p className="text-muted">Items Shared</p>
            </div>
            <div className="col-md-4 mb-4">
              <h2 className="display-4 fw-bold" style={{ color: "#00A9E0" }}>
                50+
              </h2>
              <p className="text-muted">Active Students</p>
            </div>
            <div className="col-md-4 mb-4">
              <h2 className="display-4 fw-bold" style={{ color: "#D4AF37" }}>
                100%
              </h2>
              <p className="text-muted">Free to Use</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-5 text-center"
        style={{
          background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
        }}
      >
        <div className="container">
          <h2 className="mb-3 text-white fw-bold display-5">
            Ready to Start Sharing?
          </h2>
          <p className="lead mb-4 text-white" style={{ opacity: 0.95 }}>
            Join the Niels Brock community and help reduce waste while helping fellow students!
          </p>

          {user ? (
            <Link
              to="/post"
              className="btn btn-lg px-5 fw-bold shadow-lg"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#003087",
                border: "3px solid #FFFFFF",
                transition: "all 0.3s ease",
              }}
            >
              Post Your First Item
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn btn-lg px-5 fw-bold shadow-lg"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#003087",
                border: "3px solid #FFFFFF",
                transition: "all 0.3s ease",
              }}
            >
              Login to Post
            </Link>
          )}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .category-card {
          transition: all 0.3s ease;
          border: none;
          border-radius: 12px;
          background: white;
        }
        
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 25px rgba(0, 48, 135, 0.15) !important;
        }

        .product-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
        }

        .btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export default Home;
