import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
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
    const color = colors[id % colors.length];
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
          {/* Compact Search */}
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

                {/* GREEN Notification - Incoming Requests (People interested in MY items) */}
                <li className="nav-item dropdown ms-3">
                  <button
                    className="nav-link position-relative btn btn-link"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="bi bi-inbox-fill" style={{ fontSize: "1.5rem", color: "#28a745" }}></i>
                    {incomingCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
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
                            <button
                              className="dropdown-item notification-item"
                              onClick={() => handleIncomingClick(request)}
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
                            </button>
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

                {/* RED Notification - Request Updates (Status changes on items I requested) */}
                <li className="nav-item dropdown ms-3">
                  <button
                    className="nav-link position-relative btn btn-link"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ textDecoration: "none" }}
                  >
                    <i className="bi bi-bell-fill" style={{ fontSize: "1.5rem", color: "#dc3545" }}></i>
                    {updatesCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
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
                            <button
                              className="dropdown-item notification-item"
                              onClick={() => handleUpdateClick(request)}
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
                            </button>
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
        }

        .notification-item:hover {
          background-color: #f8f9fa;
        }

        .notification-item:active {
          background-color: #e9ecef;
        }

        /* Compact search */
        .compact-search {
          max-width: 140px;
          transition: max-width 0.3s ease;
        }

        .compact-search:focus-within {
          max-width: 280px;
        }

        .compact-search-input {
          border-radius: 50px 0 0 50px;
          padding: 6px 12px;
          font-size: 14px;
          transition: width 0.3s ease;
        }

        .compact-search-btn {
          border-radius: 0 50px 50px 0;
          padding: 6px 12px;
          background: white;
          border: 1px solid #e0e0e0;
        }

        .compact-search-input::placeholder {
          font-size: 13px;
        }

        .navbar .input-group {
          flex-wrap: nowrap;
        }

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
      `}</style>
    </nav>
  );
}

export default Navbar;