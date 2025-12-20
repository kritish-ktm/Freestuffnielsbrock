import React from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row">
          {/* Logo & About Section */}
          <div className="col-md-4 mb-4">
            
            <h5 className="mb-3">Free Stuff Niels Brock</h5>
            <p className="text-white">
              <div className="mb-3">
              <Logo />
            </div>
              A student marketplace for sharing items you no longer need. 
              Sustainable, free, and built for our community.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-4">
            <h6 className="mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-house me-2"></i>Home
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/products" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-shop me-2"></i>Browse Items
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/post" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-plus-circle me-2"></i>Post an Item
                </Link>
              </li>
              
              <li className="mb-2">
                <Link to="/products" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-heart me-2"></i>My Products
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/cart" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-cart me-2"></i>My Items
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-people-fill me-2"></i>About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="col-md-4 mb-4">
            <h6 className="mb-3">Legal & Support</h6>
            <ul className="list-unstyled mb-4">
              <li className="mb-2">
                <Link to="/privacy" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-shield-lock me-2"></i>Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-file-text me-2"></i>Terms of Service
                </Link>
              </li>
            </ul>

            <h6 className="mb-3">Contact Us</h6>
            <p className="text-white mb-2">
              <i className="bi bi-envelope me-2"></i>
              <a href="freestuffnbcbc@gmail.com" className="text-white text-decoration-none hover-link">
                freestuffnbcbc@gmail.com
              </a>
            </p>
            <p className="text-white mb-3">
              <i className="bi bi-geo-alt me-2"></i>
              Copenhagen, Denmark
            </p>

            <h6 className="mb-3">Follow Us</h6>
            <div>
              <a href="https://www.facebook.com/brockbook" className="text-white me-3 social-link" target="_blank" rel="noopener noreferrer" title="Facebook">
                <i className="bi bi-facebook" style={{ fontSize: "1.5rem" }}></i>
              </a>
              <a href="https://www.instagram.com/nielsbrock/?hl=en" className="text-white me-3 social-link" target="_blank" rel="noopener noreferrer" title="Instagram">
                <i className="bi bi-instagram" style={{ fontSize: "1.5rem" }}></i>
              </a>
              <a href="https://twitter.com/nielsbrock" className="text-white social-link" target="_blank" rel="noopener noreferrer" title="Twitter">
                <i className="bi bi-twitter" style={{ fontSize: "1.5rem" }}></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="bg-secondary" />

        {/* Copyright */}
        <div className="row">
          <div className="col text-center text-white">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} Free Stuff Niels Brock. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-link {
          transition: color 0.3s ease;
        }

        .hover-link:hover {
          color: #5BA3D0 !important;
        }

        .social-link {
          transition: transform 0.3s ease, opacity 0.3s ease;
          display: inline-block;
        }

        .social-link:hover {
          transform: scale(1.2);
          opacity: 0.8;
        }

        footer {
          background: linear-gradient(135deg, #0d1b2a 0%, #1a2332 100%);
        }
      `}</style>
    </footer>
  );
}

export default Footer;