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

  // Optional: word-by-word reveal (same sentence, just split into spans)
  const titleWords = "Free Stuff Marketplace".split(" ");
  const line1Words = "Give away items you don't need.".split(" ");
  const line2Words = "Find treasures others are sharing.".split(" ");
  const line3Words = "100% free for Niels Brock students!".split(" ");

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
          {/* Title (word-by-word pop) */}
          <h1 className="display-3 fw-bold mb-3 position-relative hero-title">
            {titleWords.map((w, i) => (
              <span
                key={i}
                className="hero-word"
                style={{ animationDelay: `${90 + i * 80}ms` }}
              >
                {w}&nbsp;
              </span>
            ))}
          </h1>

          {/* Paragraph (line-by-line + word pop) */}
          <p className="lead mb-4 position-relative hero-subtitle">
            <span className="hero-line">
              {line1Words.map((w, i) => (
                <span
                  key={`l1-${i}`}
                  className="hero-word"
                  style={{ animationDelay: `${380 + i * 35}ms` }}
                >
                  {w}&nbsp;
                </span>
              ))}
            </span>
            <br />
            <span className="hero-line">
              {line2Words.map((w, i) => (
                <span
                  key={`l2-${i}`}
                  className="hero-word"
                  style={{ animationDelay: `${580 + i * 35}ms` }}
                >
                  {w}&nbsp;
                </span>
              ))}
            </span>
            <br />
            <span className="hero-line">
              {line3Words.map((w, i) => (
                <span
                  key={`l3-${i}`}
                  className="hero-word"
                  style={{ animationDelay: `${760 + i * 35}ms` }}
                >
                  {w}&nbsp;
                </span>
              ))}
            </span>
          </p>

          {/* Buttons (pop in + subtle float) */}
          <div className="d-flex gap-3 justify-content-center flex-wrap position-relative hero-buttons">
            <Link to="/products" className="btn btn-light btn-lg px-4 hero-btn hero-btn-1">
              <i className="bi bi-shop me-2"></i>
              Browse Items
            </Link>
            <Link to="/post" className="btn btn-success btn-lg px-3 hero-btn hero-btn-2">
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

        /* ---------------- TEXT ANIMATIONS (ONLY) ---------------- */

        /* Smooth intro for title wrapper */
        .hero-title {
          will-change: transform, opacity;
        }

        /* Each word pops up */
        .hero-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(18px) scale(0.98);
          animation: wordPop 650ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          will-change: transform, opacity;
        }

        @keyframes wordPop {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        /* Subtitle overall fade (keeps it cohesive) */
        .hero-subtitle {
          opacity: 0;
          transform: translateY(10px);
          animation: blockFadeUp 700ms ease-out 320ms forwards;
          will-change: transform, opacity;
        }

        @keyframes blockFadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Buttons pop in (after text) */
        .hero-buttons {
          opacity: 0;
          transform: translateY(12px);
          animation: blockFadeUp 650ms ease-out 920ms forwards;
          will-change: transform, opacity;
        }

        /* Subtle float (professional, not janky) */
        .hero-btn {
          position: relative;
          transition: transform 220ms ease, box-shadow 220ms ease;
          will-change: transform;
        }

        .hero-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 22px rgba(0, 0, 0, 0.18);
        }

        /* Tiny float only after load */
        .hero-btn-1 {
          animation: btnFloat 2.8s ease-in-out 1.4s infinite;
        }
        .hero-btn-2 {
          animation: btnFloat 3.2s ease-in-out 1.4s infinite;
        }

        @keyframes btnFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @media (max-width: 768px) {
          .hero-section { min-height: 400px; }
          .hero-section h1 { font-size: 2rem; }
          .graphic-item { font-size: 2.5rem; width: 60px; height: 60px; }

          /* Reduce motion a bit on mobile */
          .hero-word {
            animation-duration: 560ms;
          }
          .hero-btn-1, .hero-btn-2 {
            animation: none;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .hero-word,
          .hero-subtitle,
          .hero-buttons,
          .hero-btn-1,
          .hero-btn-2 {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
