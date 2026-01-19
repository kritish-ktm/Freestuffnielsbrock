import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Header() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const NUM_DOTS = 80;
    const dots = [];

    // Initialize particles (professional small white dots)
    for (let i = 0; i < NUM_DOTS; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1 + Math.random() * 2,
        angle: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.8,
        jaggedness: 0.5 + Math.random() * 0.5,
      });
    }

    function drawDot(dot) {
      ctx.beginPath();
      const spikes = 6 + Math.floor(Math.random() * 3);
      const step = (Math.PI * 2) / spikes;
      for (let i = 0; i < spikes; i++) {
        const r = dot.radius + (Math.random() * dot.jaggedness - dot.jaggedness / 2);
        const x = dot.x + r * Math.cos(i * step);
        const y = dot.y + r * Math.sin(i * step);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fill();
    }

    let animationId;
    function animate() {
      ctx.clearRect(0, 0, width, height);

      dots.forEach((dot) => {
        drawDot(dot);

        dot.x += Math.cos(dot.angle) * dot.speed;
        dot.y += Math.sin(dot.angle) * dot.speed;
        dot.angle += (Math.random() - 0.5) * 0.1;

        if (dot.x > width + dot.radius) dot.x = -dot.radius;
        if (dot.x < -dot.radius) dot.x = width + dot.radius;
        if (dot.y > height + dot.radius) dot.y = -dot.radius;
        if (dot.y < -dot.radius) dot.y = height + dot.radius;
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <header className="hero-section">
      <canvas ref={canvasRef} className="canvas-dots" />

      {/* Floating Graphics Icons */}
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

      <div className="hero-overlay">
        <div className="container text-center text-white py-5 position-relative" style={{ zIndex: 2 }}>
          {/* About-like animation: slideDown */}
          <h1 className="display-3 fw-bold mb-3 position-relative hero-title-anim">
            Free Stuff Marketplace
          </h1>

          {/* About-like animation: slideDown (slightly later) */}
          <p className="lead mb-4 position-relative hero-subtitle-anim">
            Give away items you don't need. Find treasures others are sharing.
            <br />
            100% free for Niels Brock students!
          </p>

          {/* About-like animation: fadeInUp (later) */}
          <div className="d-flex gap-3 justify-content-center flex-wrap position-relative hero-buttons-anim">
            <Link to="/products" className="btn btn-light btn-lg px-4">
              <i className="bi bi-shop me-2"></i>
              Browse Items
            </Link>
            <Link to="/post" className="btn btn-success btn-lg px-3">
              <i className="bi bi-plus-circle me-2"></i>
              Post an Item
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          background: linear-gradient(135deg, #677 0%, #0b0f3b 100%);
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

        .canvas-dots {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        /* Floating Graphics Icons */
        .floating-graphics {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-around;
          align-items: center;
          pointer-events: none;
          z-index: 1;
        }

        .graphic-item {
          font-size: 5.5rem;
          color: rgba(255, 255, 255, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          position: absolute;
          animation: gentle-sway 5s ease-in-out infinite;
          transition: all 0.3s ease;
        }

        /* Example positions */
        .graphic-phone { top: 10%; left: 5%; }
        .graphic-tablet { top: 60%; left: 8%; }
        .graphic-shirt { top: 20%; left: 25%; }
        .graphic-backpack { top: 40%; left: 0.01%; }
        .graphic-book { top: 15%; right: 25%; }
        .graphic-laptop { top: 65%; right: 20%; }
        .graphic-watch { top: 10%; right: 10%; }
        .graphic-camera { top: 20%; right: 1%; }
        .graphic-headphones { top: 35%; left: 15%; }
        .graphic-chair { top: 65%; left: 40%; }
        .graphic-cup { top: 10%; right: 50%; }
        .graphic-gamepad { top: 55%; right: 5%; }

        .graphic-item:hover {
          color: rgba(255, 255, 255, 0.6);
          transform: scale(1.25);
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
        }

        @keyframes gentle-sway {
          0%, 100% { transform: rotateZ(-3deg); }
          50% { transform: rotateZ(3deg); }
        }

        /* -------- About-page style animations applied to hero text only -------- */
        .hero-title-anim {
          animation: slideDown 0.6s ease-out;
        }

        .hero-subtitle-anim {
          animation: slideDown 0.8s ease-out;
        }

        .hero-buttons-anim {
          animation: fadeInUp 0.9s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .hero-section { min-height: 400px; }
          .hero-section h1 { font-size: 2rem; }
          .graphic-item { font-size: 2.5rem; width: 60px; height: 60px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-title-anim,
          .hero-subtitle-anim,
          .hero-buttons-anim {
            animation: none !important;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
