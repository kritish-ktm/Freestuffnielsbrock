import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="hero-section">
      <div className="hero-overlay">
        <div className="container text-center text-white py-5 position-relative">
          {/* Floating Graphics */}
          <div className="floating-graphics">
            <div className="graphic-item graphic-phone">
              <i className="bi bi-phone"></i>
            </div>
            <div className="graphic-item graphic-tablet">
              <i className="bi bi-tablet"></i>
            </div>
            <div className="graphic-item graphic-shirt">
              <i className="bi bi-bag"></i>
            </div>
            <div className="graphic-item graphic-backpack">
              <i className="bi bi-backpack"></i>
            </div>
            <div className="graphic-item graphic-book">
              <i className="bi bi-book"></i>
            </div>
            <div className="graphic-item graphic-laptop">
              <i className="bi bi-laptop"></i>
            </div>
            <div className="graphic-item graphic-watch">
              <i className="bi bi-watch"></i>
            </div>
            <div className="graphic-item graphic-camera">
              <i className="bi bi-camera"></i>
            </div>
            <div className="graphic-item graphic-headphones">
              <i className="bi bi-earbuds"></i>
            </div>
            <div className="graphic-item graphic-chair">
              <i className="bi bi-door-closed"></i>
            </div>
            <div className="graphic-item graphic-cup">
              <i className="bi bi-cup"></i>
            </div>
            <div className="graphic-item graphic-gamepad">
              <i className="bi bi-joystick"></i>
            </div>
          </div>

          <h1 className="display-3 fw-bold mb-3 position-relative">
            Free Stuff Marketplace
          </h1>
          <p className="lead mb-4 position-relative">
            Give away items you don't need. Find treasures others are sharing. 
            <br />
            100% free for Niels Brock students!
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap position-relative" style={{ zIndex: 2 }}>
            <Link to="/products" className="btn btn-light btn-lg px-4">
              <i className="bi bi-shop me-2"></i>
              Browse Items
            </Link>
            <Link to="/post" className="btn btn-success btn-lg px-4">
              <i className="bi bi-plus-circle me-2"></i>
              Post an Item
            </Link>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #677bd4ff 0%, #291141ff 100%);
          min-height: 500px;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
        }
        
        .hero-overlay {
          width: 100%;
          background: rgba(24, 21, 21, 0.2);
          padding: 60px 0;
          position: relative;
        }
        
        .hero-section h1 {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          z-index: 2;
        }

        .hero-section p {
          z-index: 2;
        }

        /* Floating Graphics */
        .floating-graphics {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 0 20px;
          z-index: 0;
          flex-wrap: wrap;
          overflow: hidden;
          pointer-events: none;
        }

        .graphic-item {
          font-size: 5.5rem;
          color: rgba(255, 255, 255, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          animation: pulse-glow 4s ease-in-out infinite;
          transition: all 0.3s ease;
          position: absolute;
          will-change: opacity;
        }

        .graphic-phone {
          top: 10%;
          left: 5%;
          animation: gentle-sway 5s ease-in-out infinite 0.9s;
        }

        .graphic-tablet {
          top: 60%;
          left: 8%;
          animation: gentle-sway 5s ease-in-out infinite;
        }

        .graphic-shirt {
          top: 20%;
          left: 25%;
          animation: gentle-sway 5s ease-in-out infinite 0.5s;
        }

        .graphic-backpack {
          top: 40%;
          left: 0.01%;
          animation: gentle-sway 5s ease-in-out infinite 0.7s;
        }

        .graphic-book {
          top: 15%;
          right: 25%;
          animation: gentle-sway 5s ease-in-out infinite 1s;
        }

        .graphic-laptop {
          top: 65%;
          right: 20%;
          animation: gentle-sway 5s ease-in-out infinite 0.3s;
        }

        .graphic-watch {
          top: 5%;
          right: 10%;
          animation: gentle-sway 5s ease-in-out infinite  1.2s;
        }

        .graphic-camera {
          top: 20%;
          right: 1%;
          animation: gentle-sway 5s ease-in-out infinite 0.5s;
        }

        .graphic-headphones {
          top: 35%;
          left: 15%;
          animation: gentle-sway 5s ease-in-out infinite  0.6s;
        }

        .graphic-chair {
          top: 50%;
          left: 50%;
          animation: gentle-sway 5s ease-in-out infinite 0.9s;
        }

        .graphic-cup {
          top: 1%;
          right: 50%;
          animation: gentle-sway 5s ease-in-out infinite 0.8s;
        }

        .graphic-gamepad {
          top: 55%;
          right: 5%;
          animation: gentle-sway 5s ease-in-out infinite 0.4s;
        }

        .graphic-item:hover {
          color: rgba(255, 255, 255, 0.6);
          transform: scale(1.25) !important;
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
        }

        @keyframes bounce-rotate {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.35;
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
            opacity: 0.4;
          }
        }
        
        @keyframes gentle-sway {
          0%, 100% {
            transform: rotateZ(-3deg);
          }
          50% {
            transform: rotateZ(3deg);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.45;
          }
        }
        
        @media (max-width: 768px) {
          .hero-section {
            min-height: 400px;
          }

          .hero-section h1 {
            font-size: 2rem;
          }

          .graphic-item {
            font-size: 2.5rem;
            width: 60px;
            height: 60px;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;