import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    try {
      console.log("Logout clicked");
      await signOut();
      console.log("Signout completed, navigating to login");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login", { replace: true });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear search after navigating
    }
  };

  // Get user display name
  const getUserName = () => {
    if (!user) return "";
    return user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           "User";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm">
      <div className="container">
        {/* Brand/Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img 
            src="/freestuffnielsbrocklogo.png" 
            alt="Free Stuff Niels Brock" 
            height="45"
            style={{ objectFit: "contain" }}
          />
          <span className="fw-bold">Free Stuff <span style={{ color: "#D4AF37" }}>Niels Brock</span></span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Search Bar */}
          <form className="d-flex mx-auto my-2 my-lg-0" onSubmit={handleSearch} style={{ maxWidth: "400px", width: "100%" }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderRight: "none" }}
              />
              <button 
                className="btn btn-outline-secondary" 
                type="submit"
                style={{ borderLeft: "none", backgroundColor: "white" }}
              >
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/products">
                Browse Items
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fw-semibold" to="/about">
                About Us
              </Link>
            </li>

            {user ? (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link btn text-white ms-2 px-3" 
                    to="/post"
                    style={{ backgroundColor: "#D4AF37", border: "none" }}
                  >
                    + Post Item
                  </Link>
                </li>

                <li className="nav-item ms-3">
                  <Link className="nav-link position-relative" to="/cart">
                    <i className="bi bi-heart" style={{ fontSize: "1.5rem" }}></i>
                  </Link>
                </li>

                {/* User Info Dropdown */}
                <li className="nav-item dropdown ms-3">
                  <button
                    className="nav-link dropdown-toggle d-flex align-items-center btn btn-link"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="bi bi-person-circle me-2" style={{ fontSize: "1.5rem" }}></i>
                    <span className="d-none d-md-inline">{getUserName()}</span>
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <span className="dropdown-item-text">
                        <small className="text-muted">Signed in as</small>
                        <br />
                        <strong>{user.email}</strong>
                      </span>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-gear me-2"></i>
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/products">
                        <i className="bi bi-grid me-2"></i>
                        My Items
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/my-requests">
                        <i className="bi bi-list-check me-2"></i>
                        My Requests
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/cart">
                        <i className="bi bi-heart me-2"></i>
                        Saved Items
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item text-danger" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item ms-3">
                <Link 
                  to="/login" 
                  className="btn btn-primary px-4"
                  style={{ backgroundColor: "#003087", border: "none" }}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          border-bottom: 1px solid #f0f0f0;
        }

        .nav-link {
          color: #000 !important;
        }

        .nav-link:hover {
          color: #D4AF37 !important;
        }

        .dropdown-menu {
          min-width: 250px;
        }

        .dropdown-item:hover {
          background-color: #f8f8f8;
          color: #D4AF37;
        }

        .btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .input-group .form-control:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 0.2rem rgba(212, 175, 55, 0.25);
        }

        .input-group .btn:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 0.2rem rgba(212, 175, 55, 0.25);
        }
      `}</style>
    </nav>
  );
}

export default Navbar;