import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ UPDATED: hide navbar on scroll down, only show when at top
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  const {
    incomingRequests,
    requestUpdates,
    incomingCount,
    updatesCount,
    markIncomingAsRead,
    markAllIncomingAsRead,
    markUpdateAsRead,
    markAllUpdatesAsRead
  } = useNotifications();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // If at the very top (0-10px), always show navbar
      if (currentScrollY < 10) {
        setIsHidden(false);
      } 
      // If scrolling down and past 80px, hide navbar
      else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsHidden(true);
      }
      // Don't show on scroll up unless at the very top

      lastScrollY.current = currentScrollY;

      // ✅ CLOSE ALL DROPDOWNS ON ANY SCROLL - they stay closed
      // Find all dropdown toggles and close them
      const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
      dropdownToggles.forEach(toggle => {
        // Remove the 'show' class and aria-expanded
        toggle.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        
        // Find and close the associated dropdown menu
        const dropdownMenu = toggle.nextElementSibling;
        if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
          dropdownMenu.classList.remove('show');
        }
      });

      // Also close any open dropdowns using Bootstrap's method
      const openDropdowns = document.querySelectorAll('.dropdown-menu.show');
      openDropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const getUserName = () => {
    if (!user) return "";
    return user.user_metadata?.full_name || 
           user.email?.split('@')[0] || 
           "User";
  };

  const getPlaceholderImage = (id) => {
    const colors = ['667eea', '764ba2', 'f093fb', '4facfe', 'fa709a', '43e97b'];
    const safeId = Number(id) || 0;
    const color = colors[safeId % colors.length];
    return `https://via.placeholder.com/50x50/${color}/ffffff?text=Item`;
  };

  const handleIncomingClick = (request) => {
    markIncomingAsRead(request.id);
    navigate("/manage-requests");
  };

  const handleUpdateClick = (request) => {
    markUpdateAsRead(request.id);
    navigate("/requests");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm navbar-hide-on-scroll"
      style={{
        transform: isHidden ? "translateY(-110%)" : "translateY(0)",
        transition: "transform 280ms ease",
        willChange: "transform",
        zIndex: 1030,
      }}
    >
      <div className="container">
        {/* Brand/Logo - LARGER SIZE */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <img 
            src="/freestuffnielsbrocklogo.png?v=2" 
            alt="Free Stuff Niels Brock" 
            height="80" width="80"  
            style={{ objectFit: "contain" }}
          />
          <span className="fw-bold">Free Stuff <span style={{ color: "#7FD856" }}>Niels Brock</span></span>
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
          {/* Compact Search - FIXED to always show button */}
          <form
            className="d-flex align-items-center mx-3 compact-search"
            onSubmit={handleSearch}
          >
            <div className="input-group">
              <input
                type="text"
                className="form-control compact-search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn compact-search-btn" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          <ul className="navbar-nav ms-auto align-items-center gap-1">
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-2" to="/">
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fw-semibold px-2" to="/products">
                Browse
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link fw-semibold px-2" to="/about">
                About
              </Link>
            </li>

            {user ? (
              <>
                <li className="nav-item">
                  <Link 
                    className="nav-link btn text-white px-3 py-1" 
                    to="/post"
                    style={{ backgroundColor: "#7FD856", border: "none", fontSize: "0.9rem", whiteSpace: "nowrap" }}
                  >
                    + Post
                  </Link>
                </li>

                <li className="nav-item ms-2">
                  <Link className="nav-link position-relative p-1" to="/cart">
                    <i className="bi bi-heart" style={{ fontSize: "1.4rem" }}></i>
                  </Link>
                </li>

                {/* GREEN Notification - Incoming Requests */}
                <li className="nav-item dropdown ms-2">
                  <button
                    className="nav-link position-relative btn btn-link p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="bi bi-inbox-fill" style={{ fontSize: "1.4rem", color: "#28a745" }}></i>
                    {incomingCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ fontSize: "0.65rem" }}>
                        {incomingCount}
                        <span className="visually-hidden">unread incoming requests</span>
                      </span>
                    )}
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end notification-dropdown" style={{ width: "350px", maxHeight: "400px", overflowY: "auto" }}>
                    <li className="dropdown-header d-flex justify-content-between align-items-center">
                      <span className="fw-bold" style={{ color: "#28a745" }}>
                        <i className="bi bi-inbox me-2"></i>
                        Incoming Requests
                      </span>
                      {incomingCount > 0 && (
                        <button 
                          className="btn btn-sm btn-link text-decoration-none"
                          onClick={markAllIncomingAsRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </li>
                    <li><hr className="dropdown-divider" /></li>

                    {incomingCount === 0 ? (
                      <li className="px-3 py-4 text-center text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: "2rem" }}></i>
                        <p className="mb-0 mt-2 small">No new requests</p>
                      </li>
                    ) : (
                      <>
                        {incomingRequests.map((request) => (
                          <li key={request.id}>
                            <a
                              href="#"
                              className="dropdown-item notification-item"
                              onClick={(e) => {
                                e.preventDefault();
                                handleIncomingClick(request);
                              }}
                            >
                              <div className="d-flex align-items-start gap-2">
                                <img
                                  src={request.item_image || getPlaceholderImage(request.item_id)}
                                  alt={request.item_name}
                                  className="rounded"
                                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                  onError={(e) => { e.target.src = getPlaceholderImage(request.item_id); }}
                                />
                                <div className="flex-grow-1">
                                  <p className="mb-1 fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>
                                    {request.requester_name} is interested
                                  </p>
                                  <p className="mb-1 text-muted small">
                                    in your <strong>{request.item_name}</strong>
                                  </p>
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {new Date(request.created_at).toLocaleDateString()}
                                  </small>
                                </div>
                                <span className="badge bg-success-subtle text-success">NEW</span>
                              </div>
                            </a>
                            <hr className="dropdown-divider" />
                          </li>
                        ))}
                        <li>
                          <Link 
                            className="dropdown-item text-center text-primary fw-semibold"
                            to="/manage-requests"
                          >
                            View All Requests →
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </li>

                {/* RED Notification - Request Updates */}
                <li className="nav-item dropdown ms-2">
                  <button
                    className="nav-link position-relative btn btn-link p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="bi bi-bell-fill" style={{ fontSize: "1.4rem", color: "#dc3545" }}></i>
                    {updatesCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.65rem" }}>
                        {updatesCount}
                        <span className="visually-hidden">unread updates</span>
                      </span>
                    )}
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end notification-dropdown" style={{ width: "350px", maxHeight: "400px", overflowY: "auto" }}>
                    <li className="dropdown-header d-flex justify-content-between align-items-center">
                      <span className="fw-bold" style={{ color: "#dc3545" }}>
                        <i className="bi bi-bell me-2"></i>
                        Request Updates
                      </span>
                      {updatesCount > 0 && (
                        <button 
                          className="btn btn-sm btn-link text-decoration-none"
                          onClick={markAllUpdatesAsRead}
                        >
                          Mark all read
                        </button>
                      )}
                    </li>
                    <li><hr className="dropdown-divider" /></li>

                    {updatesCount === 0 ? (
                      <li className="px-3 py-4 text-center text-muted">
                        <i className="bi bi-bell" style={{ fontSize: "2rem" }}></i>
                        <p className="mb-0 mt-2 small">No new updates</p>
                      </li>
                    ) : (
                      <>
                        {requestUpdates.map((request) => (
                          <li key={request.id}>
                            <a
                              href="#"
                              className="dropdown-item notification-item"
                              onClick={(e) => {
                                e.preventDefault();
                                handleUpdateClick(request);
                              }}
                            >
                              <div className="d-flex align-items-start gap-2">
                                <img
                                  src={request.items?.image || getPlaceholderImage(request.items?.id)}
                                  alt={request.items?.name}
                                  className="rounded"
                                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                  onError={(e) => { e.target.src = getPlaceholderImage(request.items?.id); }}
                                />
                                <div className="flex-grow-1">
                                  <p className="mb-1 fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>
                                    Request {request.status === 'approved' ? 'Approved' : 'Rejected'}
                                  </p>
                                  <p className="mb-1 text-muted small">
                                    <strong>{request.items?.name}</strong>
                                  </p>
                                  <small className="text-muted">
                                    <i className="bi bi-clock me-1"></i>
                                    {new Date(request.last_status_change || request.created_at).toLocaleDateString()}
                                  </small>
                                </div>
                                <span className={`badge ${request.status === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                                  {request.status === 'approved' ? '✓' : '✗'}
                                </span>
                              </div>
                            </a>
                            <hr className="dropdown-divider" />
                          </li>
                        ))}
                        <li>
                          <Link 
                            className="dropdown-item text-center text-primary fw-semibold"
                            to="/requests"
                          >
                            View All Updates →
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </li>

                {/* User Info Dropdown */}
                <li className="nav-item dropdown ms-2">
                  <button
                    className="nav-link dropdown-toggle d-flex align-items-center btn btn-link p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="bi bi-person-circle me-1" style={{ fontSize: "1.4rem" }}></i>
                    <span className="d-none d-lg-inline" style={{ fontSize: "0.9rem" }}>{getUserName()}</span>
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
                      <Link className="dropdown-item" to="/manage-requests">
                        <i className="bi bi-inbox me-2"></i>
                        Manage Requests
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/requests">
                        <i className="bi bi-bell me-2"></i>
                        My Request Status
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
              <li className="nav-item ms-2">
                <Link 
                  to="/login" 
                  className="btn btn-primary px-3 py-1"
                  style={{ backgroundColor: "#003087", border: "none", fontSize: "0.9rem" }}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <style jsx>{`
        /* Notification styles */
        .notification-dropdown {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .notification-item {
          padding: 12px 16px;
          transition: background-color 0.2s;
          border: none;
          width: 100%;
          text-align: left;
          text-decoration: none;
          display: block;
        }

        .notification-item:hover {
          background-color: #f8f9fa;
        }

        .notification-item:active {
          background-color: #e9ecef;
        }

        /* Compact navbar */
        .navbar-nav {
          gap: 0.25rem;
        }

        .navbar-nav .nav-link {
          padding: 0.4rem 0.6rem !important;
          font-size: 0.95rem;
          white-space: nowrap;
        }

        /* ✅ FIXED: Compact search - always shows button */
        .compact-search {
          min-width: 160px;
          max-width: 160px;
          transition: max-width 0.3s ease;
        }

        .compact-search:focus-within {
          max-width: 240px;
        }

        .compact-search-input {
          border-radius: 50px 0 0 50px;
          padding: 5px 10px;
          font-size: 13px;
          border: 1px solid #e0e0e0;
          border-right: none;
        }

        .compact-search-btn {
          border-radius: 0 50px 50px 0;
          padding: 5px 12px;
          background: white;
          border: 1px solid #e0e0e0;
          border-left: none;
          flex-shrink: 0;
        }

        .compact-search-btn:hover {
          background-color: #f8f9fa;
        }

        .compact-search-input::placeholder {
          font-size: 12px;
        }

        .navbar .input-group {
          flex-wrap: nowrap;
        }

        .navbar {
          border-bottom: 1px solid #f0f0f0;
          padding: 0.5rem 0;
        }

        .nav-link {
          color: #000 !important;
        }

        .nav-link:hover {
          color: #7FD856 !important;
        }

        .dropdown-menu {
          min-width: 250px;
        }

        .dropdown-item:hover {
          background-color: #f8f8f8;
          color: #7FD856;
        }

        .btn:hover {
          opacity: 0.9;
        }

        /* Badge animations */
        .badge.rounded-pill {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 991px) {
          .navbar-nav {
            gap: 0.5rem;
            padding-top: 1rem;
          }

          .navbar-nav .nav-link {
            padding: 0.5rem 1rem !important;
          }

          .compact-search {
            max-width: 100%;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;