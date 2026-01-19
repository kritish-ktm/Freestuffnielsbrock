// src/pages/Home.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

/**
 * Small, performance-friendly IntersectionObserver hook
 */
function useInView({ threshold = 0.15, rootMargin = "0px 0px -10% 0px", once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If already in view and once is true, skip setting up IO
    if (inView && once) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once, inView]);

  return { ref, inView };
}

/**
 * Ripple effect helper (no external libs)
 */
function createRipple(e) {
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.className = "ripple";
  ripple.style.width = ripple.style.height = `${size}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;

  btn.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

/**
 * Count-up animation (requestAnimationFrame, smooth + light)
 */
function useCountUp(startWhen, targets, durationMs = 1100) {
  const [values, setValues] = useState(() => targets.map(() => 0));

  useEffect(() => {
    if (!startWhen) return;

    let rafId = 0;
    const start = performance.now();
    const from = targets.map(() => 0);

    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      // EaseOutCubic
      const eased = 1 - Math.pow(1 - t, 3);

      const next = targets.map((to, i) => Math.round(from[i] + (to - from[i]) * eased));
      setValues(next);

      if (t < 1) rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [startWhen, durationMs, targets]);

  return values;
}

function Home() {
  const { user } = useAuth();
  const [latestItems, setLatestItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [communityComments, setCommunityComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Parallax (very light)
  const [scrollY, setScrollY] = useState(0);

  const staticTestimonials = [
    {
      id: 1,
      name: "Raman Sukhu",
      section: "Section E",
      course: "Computer Science",
      feedback:
        "I found amazing textbooks for free! This platform saved me hundreds of kroner. Thank you!",
      initials: "RS",
      color: "#003087",
    },
    {
      id: 2,
      name: "Lok Bahadur Gharti Magar",
      section: "Section C",
      course: "Computer Science",
      feedback:
        "Selling my old laptop was so easy. Connected with a buyer within hours. Highly recommend!",
      initials: "LM",
      color: "#00A9E0",
    },
    {
      id: 3,
      name: "Bibek Adhikari",
      section: "Section B",
      course: "Marketing",
      feedback: "Great community! Everyone is friendly and responsive. Got furniture for my dorm room!",
      initials: "BA",
      color: "#D4AF37",
    },
    {
      id: 4,
      name: "Smita Shrestha",
      section: "Section E",
      course: "Computer Science",
      feedback: "The best student marketplace! Fast, secure, and completely free. Love it!",
      initials: "SS",
      color: "#003087",
    },
    {
      id: 5,
      name: "Isabella Petersen",
      section: "Section D",
      course: "International Business",
      feedback: "Posted my bike and sold it the same day! Super convenient for students.",
      initials: "IP",
      color: "#00A9E0",
    },
    {
      id: 6,
      name: "Md Samiul Haque",
      section: "Section A",
      course: "Economics",
      feedback: "Found exactly what I needed for my studies. This platform is a game-changer!",
      initials: "MH",
      color: "#D4AF37",
    },
  ];

  const faqs = [
    {
      question: "How do I post an item?",
      answer:
        "Simply log in with your Niels Brock email, click on 'Post Item' in the navigation menu, fill in the details about your item (name, description, price, category, condition, location), upload a photo if you'd like, and submit! Your item will be visible to all students immediately.",
    },
    {
      question: "Is this platform free?",
      answer:
        "Yes! Free Stuff Niels Brock is 100% free to use. There are no listing fees, no transaction fees, and no hidden costs. We're a student-led initiative created to help the Niels Brock community share and exchange items easily.",
    },
    {
      question: "Who can use this platform?",
      answer:
        "This platform is exclusively for Niels Brock Copenhagen Business College students. You need a valid Niels Brock student email address (@niels-brock.dk or @student.niels-brock.dk) to sign up and access the platform.",
    },
    {
      question: "How do I contact a seller?",
      answer:
        "Click on any item to view its details. On the product page, you'll find the seller's email address and contact information. You can reach out to them directly via email to arrange pickup, ask questions, or negotiate.",
    },
    {
      question: "Can I edit/delete my posts?",
      answer:
        "Yes! You have full control over your listings. Go to your profile page to see all your posted items. From there, you can edit item details, update photos, mark items as sold, or delete listings that are no longer available.",
    },
    {
      question: "Is my data safe?",
      answer:
        "Absolutely! We take your privacy seriously. Your data is encrypted and stored securely using Supabase, a trusted cloud database provider. We only collect essential information (name, email, section) and never share your data with third parties. We comply with GDPR regulations.",
    },
    {
      question: "How long do listings stay active?",
      answer:
        "Listings remain active indefinitely until you delete them or mark them as sold. We recommend removing or updating your listings once an item is no longer available to keep the marketplace current and relevant for everyone.",
    },
  ];

  // Intersection triggers
  const heroRef = useRef(null);
  const featuresIO = useInView({ threshold: 0.18, rootMargin: "0px 0px -8% 0px", once: true });
  const productsIO = useInView({ threshold: 0.14, rootMargin: "0px 0px -10% 0px", once: true });
  const categoriesIO = useInView({ threshold: 0.14, rootMargin: "0px 0px -12% 0px", once: true });
  const statsIO = useInView({ threshold: 0.22, rootMargin: "0px 0px -12% 0px", once: true });
  const faqIO = useInView({ threshold: 0.14, rootMargin: "0px 0px -12% 0px", once: true });
  const testimonialIO = useInView({ threshold: 0.14, rootMargin: "0px 0px -12% 0px", once: true });

  useEffect(() => {
    fetchLatestItems();
    fetchCommunityComments();

    // Page transition fade-in on load
    document.documentElement.classList.add("page-fade-in");
    const t = window.setTimeout(() => {
      document.documentElement.classList.add("page-fade-in-done");
    }, 30);

    // Lightweight parallax (throttled with rAF)
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        raf = 0;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLatestItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setLatestItems(data || []);
    } catch (error) {
      console.error("Error fetching latest items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityComments = async () => {
    try {
      setCommentsLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("page", "about")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      const transformedComments = (data || []).map((comment, index) => {
        const colors = ["#003087", "#00A9E0", "#D4AF37", "#667eea", "#764ba2", "#f093fb"];
        const initials = comment.user_name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);

        return {
          id: `comment-${comment.id}`,
          name: comment.user_name,
          section: "Community Member",
          course: "Niels Brock Student",
          feedback: comment.comment,
          initials: initials,
          color: colors[index % colors.length],
          isRealComment: true,
        };
      });

      setCommunityComments(transformedComments);
    } catch (error) {
      console.error("Error fetching community comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const allTestimonials = useMemo(
    () => [...staticTestimonials, ...communityComments],
    [staticTestimonials, communityComments]
  );

  const handleLiveDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;

      setLatestItems(latestItems.filter((item) => item.id !== id));
      alert("Item deleted!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete: " + error.message);
    }
  };

  const getPlaceholderImage = (id) => {
    const colors = ["667eea", "764ba2", "f093fb", "4facfe", "fa709a", "43e97b"];
    const color = colors[id % colors.length];
    return `https://via.placeholder.com/300x200/${color}/ffffff?text=Item`;
  };

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Stats targets (keep your existing content logic)
  const itemsSharedTarget = latestItems.length > 0 ? latestItems.length * 10 : 0;
  const activeStudentsTarget = 50;
  const freeToUseTarget = 100;

  const [itemsShared, activeStudents, freeToUse] = useCountUp(
    statsIO.inView,
    [itemsSharedTarget, activeStudentsTarget, freeToUseTarget],
    1200
  );

  // Progress bars (fill when visible)
  const progress = useMemo(() => {
    if (!statsIO.inView) return { p1: 0, p2: 0, p3: 0 };
    return { p1: Math.min(100, Math.max(10, itemsSharedTarget ? 82 : 10)), p2: 72, p3: 100 };
  }, [statsIO.inView, itemsSharedTarget]);

  // Hero parallax transforms
  const heroBgTranslate = Math.min(40, scrollY * 0.06);
  const heroContentTranslate = Math.min(28, scrollY * 0.035);

  const onRippleClick = useCallback((e) => {
    createRipple(e);
  }, []);

  return (
    <div>
      <Header />

      {/* Beta Alert */}
      <div
        className="alert alert-warning text-center mb-0"
        role="alert"
        style={{
          borderRadius: 0,
          animation: "slideDownBanner 0.6s ease-out",
          background: "linear-gradient(135deg, #ffc107 0%, #ff9800 100%)",
          border: "none",
          boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)",
        }}
      >
        <i className="bi bi-cone-striped me-2" style={{ fontSize: "1.2rem" }}></i>
        <strong>Beta Version:</strong> We're actively testing and improving the platform. Your feedback is welcome!
      </div>

      {/* Student-Led Project Banner */}
      <div
        className="alert alert-info text-center mb-0"
        role="alert"
        style={{
          borderRadius: 0,
          background: "linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)",
          border: "none",
          color: "#ffffff",
          fontSize: "0.95rem",
          animation: "slideDownBanner 0.8s ease-out",
          boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)",
        }}
      >
        <i className="bi bi-mortarboard-fill me-2" style={{ fontSize: "1.2rem" }}></i>
        <strong>Student-Led Project:</strong> This platform is created by students for students and is not an official
        website or service of Niels Brock.
      </div>

      {/* HERO SECTION (modern animations, same purpose + CTA) */}
      <section
        ref={heroRef}
        className="hero-section position-relative overflow-hidden"
        aria-label="Hero"
      >
        {/* Animated gradient layer */}
        <div
          className="hero-bg"
          style={{
            transform: `translate3d(0, ${heroBgTranslate}px, 0)`,
          }}
        />
        {/* Subtle geometric shapes */}
        <div className="hero-shapes" aria-hidden="true">
          <span className="shape shape-1" />
          <span className="shape shape-2" />
          <span className="shape shape-3" />
          <span className="shape shape-4" />
        </div>

        <div className="container py-5 position-relative">
          <div
            className="hero-content"
            style={{
              transform: `translate3d(0, ${heroContentTranslate}px, 0)`,
            }}
          >
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <div className="hero-kicker mb-3">
                  <span className="badge rounded-pill bg-light text-dark border hero-kicker-badge">
                    <i className="bi bi-shield-check me-2" />
                    Free • Student-only • Community-driven
                  </span>
                </div>

                <h1 className="hero-title">
                  Free Stuff Marketplace
                  <span className="hero-title-accent"> for Niels Brock</span>
                </h1>

                <p className="hero-subtitle">
                  Share, reuse, and connect with students. Post items you don’t need, find what you do — fast, secure,
                  and free.
                </p>

                <div className="d-flex flex-wrap gap-3 mt-4">
                  {user ? (
                    <Link
                      to="/post"
                      onClick={onRippleClick}
                      className="btn btn-lg hero-cta-btn shadow-lg position-relative overflow-hidden"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#003087",
                        border: "3px solid #FFFFFF",
                      }}
                    >
                      <i className="bi bi-upload me-2" />
                      Post an Item
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      onClick={onRippleClick}
                      className="btn btn-lg hero-cta-btn shadow-lg position-relative overflow-hidden"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: "#003087",
                        border: "3px solid #FFFFFF",
                      }}
                    >
                      <i className="bi bi-box-arrow-in-right me-2" />
                      Login to Post
                    </Link>
                  )}

                  <Link
                    to="/products"
                    className="btn btn-lg btn-outline-light hero-secondary-btn"
                    style={{
                      borderWidth: 2,
                    }}
                  >
                    Browse Items <i className="bi bi-arrow-right ms-2" />
                  </Link>
                </div>

                <div className="hero-metrics mt-4 d-flex flex-wrap gap-3">
                  <div className="metric-chip">
                    <i className="bi bi-lightning-charge me-2" />
                    Fast listings
                  </div>
                  <div className="metric-chip">
                    <i className="bi bi-lock me-2" />
                    Student-only access
                  </div>
                  <div className="metric-chip">
                    <i className="bi bi-recycle me-2" />
                    Reduce waste
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                {/* Hero visual panel (no content changes; just presentation) */}
                <div className="hero-panel">
                  <div className="hero-panel-top d-flex align-items-center justify-content-between">
                    <span className="hero-panel-dot-group">
                      <span className="dot dot-1" />
                      <span className="dot dot-2" />
                      <span className="dot dot-3" />
                    </span>
                    <span className="hero-panel-title">
                      <i className="bi bi-stars me-2" />
                      Latest activity
                    </span>
                  </div>

                  <div className="hero-panel-body">
                    <div className="mini-list">
                      <div className="mini-row">
                        <span className="mini-ic">
                          <i className="bi bi-book" />
                        </span>
                        <div className="mini-txt">
                          <div className="mini-line strong" />
                          <div className="mini-line" />
                        </div>
                        <span className="mini-pill">FREE</span>
                      </div>

                      <div className="mini-row">
                        <span className="mini-ic">
                          <i className="bi bi-laptop" />
                        </span>
                        <div className="mini-txt">
                          <div className="mini-line strong" />
                          <div className="mini-line" />
                        </div>
                        <span className="mini-pill">DKK</span>
                      </div>

                      <div className="mini-row">
                        <span className="mini-ic">
                          <i className="bi bi-bicycle" />
                        </span>
                        <div className="mini-txt">
                          <div className="mini-line strong" />
                          <div className="mini-line" />
                        </div>
                        <span className="mini-pill">Today</span>
                      </div>
                    </div>

                    <div className="hero-panel-foot mt-3">
                      <div className="pulse-indicator me-2" />
                      Live marketplace feel — smooth and modern
                    </div>
                  </div>
                </div>

                <div className="hero-note mt-3">
                  <i className="bi bi-info-circle me-2" />
                  Tip: Hover cards, scroll to reveal sections, and click buttons for micro-interactions.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* bottom fade */}
        <div className="hero-bottom-fade" aria-hidden="true" />
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5" style={{ color: "#003087" }}>
            How It Works
          </h2>
          <div ref={featuresIO.ref} className={`row g-4 reveal-wrap ${featuresIO.inView ? "show" : ""}`}>
            <div className="col-md-4 text-center">
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-bounce"
                style={{ width: "80px", height: "80px", backgroundColor: "#003087" }}
              >
                <i className="bi bi-upload" style={{ fontSize: "2rem" }}></i>
              </div>
              <h4 style={{ color: "#003087" }}>1. Post Your Item</h4>
              <p className="text-muted">List items you no longer need. It's quick, easy, and free!</p>
            </div>

            <div className="col-md-4 text-center">
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-bounce"
                style={{ width: "80px", height: "80px", backgroundColor: "#00A9E0" }}
              >
                <i className="bi bi-search" style={{ fontSize: "2rem" }}></i>
              </div>
              <h4 style={{ color: "#003087" }}>2. Browse Items</h4>
              <p className="text-muted">Search through items posted by fellow students.</p>
            </div>

            <div className="col-md-4 text-center">
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-bounce"
                style={{ width: "80px", height: "80px", backgroundColor: "#D4AF37" }}
              >
                <i className="bi bi-hand-thumbs-up" style={{ fontSize: "2rem" }}></i>
              </div>
              <h4 style={{ color: "#003087" }}>3. Pick It Up</h4>
              <p className="text-muted">Contact the poster and arrange a pickup. Simple as that!</p>
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
              className="btn btn-outline-primary border-2 micro-btn"
              style={{ borderColor: "#00A9E0", color: "#00A9E0" }}
              onClick={onRippleClick}
            >
              View All Items <i className="bi bi-arrow-right ms-2"></i>
            </Link>
          </div>

          <div ref={productsIO.ref}>
            {loading ? (
              // Skeletons instead of spinner
              <div className="row g-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="col-lg-4 col-md-4 col-sm-6 mb-4">
                    <div className="card h-100 shadow-sm product-card border-0 skeleton-card">
                      <div className="skeleton skeleton-img" />
                      <div className="card-body p-3">
                        <div className="skeleton skeleton-line w-75 mb-2" />
                        <div className="skeleton skeleton-line w-100 mb-2" />
                        <div className="skeleton skeleton-line w-60 mb-3" />
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="skeleton skeleton-pill w-35" />
                          <div className="skeleton skeleton-pill w-25" />
                        </div>
                        <div className="skeleton skeleton-btn mt-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : latestItems.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: "4rem", color: "#ccc" }}></i>
                <p className="text-muted mt-3">No items yet. Be the first to post!</p>
                {user && (
                  <Link to="/post" className="btn btn-success mt-3 micro-btn" onClick={onRippleClick}>
                    Post an Item
                  </Link>
                )}
              </div>
            ) : (
              <div className="row g-3">
                {latestItems.map((product, idx) => (
                  <div
                    key={product.id}
                    className={`col-lg-4 col-md-4 col-sm-6 mb-4 reveal-item ${
                      productsIO.inView ? "show" : ""
                    }`}
                    style={{ animationDelay: `${idx * 90}ms` }}
                  >
                    <div className="card h-100 shadow-sm product-card product-animate">
                      <div className="product-img-wrap">
                        <img
                          src={product.image || getPlaceholderImage(product.id)}
                          className="card-img-top product-img"
                          alt={product.name}
                          style={{ height: "150px", objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src = getPlaceholderImage(product.id);
                          }}
                        />

                        {/* Badge animation (slides in from corner) */}
                        <div className="corner-badge">
                          <span className="badge bg-dark-subtle text-dark border">
                            <i className="bi bi-tag me-1" />
                            {product.price === 0 ? "FREE" : `${product.price} DKK`}
                          </span>
                        </div>
                      </div>

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
                                  onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                                  onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
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
                            className="btn btn-outline-primary btn-sm w-100 micro-btn interested-btn"
                            onClick={onRippleClick}
                          >
                            <i className="bi bi-eye me-2" />
                            View Details
                          </Link>

                          {user && product.posted_by === user.id && (
                            <button
                              className="btn btn-danger btn-sm w-100 mt-2 micro-btn"
                              onClick={(e) => {
                                onRippleClick(e);
                                handleLiveDelete(product.id);
                              }}
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
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-5">
        <div className="container" ref={categoriesIO.ref}>
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
            ].map((category, i) => (
              <div
                key={category.name}
                className={`col-md-2 col-sm-4 col-6 category-wave ${categoriesIO.inView ? "show" : ""}`}
                style={{ animationDelay: `${i * 85}ms` }}
              >
                <Link to="/products" className="text-decoration-none">
                  <div className="card h-100 text-center shadow-sm category-card border-0 category-overlay">
                    <div className="card-body">
                      <i className={`bi ${category.icon} category-icon`} style={{ fontSize: "3rem", color: category.color }}></i>
                      <h6 className="mt-3 mb-0" style={{ color: "#003087" }}>
                        {category.name}
                      </h6>
                    </div>
                    <div className="overlay-slide" aria-hidden="true" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-light" ref={statsIO.ref}>
        <div className={`container ${statsIO.inView ? "stats-show" : ""}`}>
          <div className="row text-center">
            <div className="col-md-4 mb-4 stat-card">
              <div className="stat-ic">
                <i className="bi bi-box-seam" />
              </div>
              <h2 className="display-4 fw-bold stat-number" style={{ color: "#003087" }}>
                {itemsSharedTarget > 0 ? `${itemsShared}+` : "0"}
              </h2>
              <p className="text-muted">Items Shared</p>
              <div className="progress stat-progress" role="progressbar" aria-label="Items shared progress">
                <div className="progress-bar" style={{ width: `${progress.p1}%` }} />
              </div>
            </div>

            <div className="col-md-4 mb-4 stat-card">
              <div className="stat-ic">
                <i className="bi bi-people" />
              </div>
              <h2 className="display-4 fw-bold stat-number" style={{ color: "#00A9E0" }}>
                {activeStudents}+
              </h2>
              <p className="text-muted">Active Students</p>
              <div className="progress stat-progress" role="progressbar" aria-label="Active students progress">
                <div className="progress-bar" style={{ width: `${progress.p2}%` }} />
              </div>
            </div>

            <div className="col-md-4 mb-4 stat-card">
              <div className="stat-ic">
                <i className="bi bi-check2-circle" />
              </div>
              <h2 className="display-4 fw-bold stat-number" style={{ color: "#D4AF37" }}>
                {freeToUse}%
              </h2>
              <p className="text-muted">Free to Use</p>
              <div className="progress stat-progress" role="progressbar" aria-label="Free to use progress">
                <div className="progress-bar" style={{ width: `${progress.p3}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-5" ref={faqIO.ref}>
        <div className={`container reveal-faq ${faqIO.inView ? "show" : ""}`} style={{ maxWidth: "800px" }}>
          <h2 className="text-center mb-5" style={{ color: "#003087" }}>
            Frequently Asked Questions
          </h2>

          <div className="accordion" id="faqAccordion">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="accordion-item border-0 shadow-sm mb-3 faq-item"
                style={{ borderRadius: "12px", overflow: "hidden" }}
              >
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button ${openFAQ === index ? "" : "collapsed"}`}
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    style={{
                      backgroundColor: openFAQ === index ? "#003087" : "white",
                      color: openFAQ === index ? "white" : "#003087",
                      fontWeight: "600",
                      borderRadius: openFAQ === index ? "12px 12px 0 0" : "12px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {faq.question}
                  </button>
                </h2>
                <div className={`accordion-collapse collapse ${openFAQ === index ? "show" : ""}`}>
                  <div className="accordion-body" style={{ backgroundColor: "#f8f9fa" }}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section - Marquee Style */}
      <section className="py-5 bg-light overflow-hidden" ref={testimonialIO.ref}>
        <div className={`container ${testimonialIO.inView ? "testimonials-show" : ""}`}>
          <h2 className="text-center mb-2" style={{ color: "#003087" }}>
            What Students Say
          </h2>
          <p className="text-center text-muted mb-5">
            <small>Real feedback from our community members</small>
          </p>
        </div>

        {commentsLoading ? (
          <div className="container">
            <div className="row g-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="col-md-4">
                  <div className="card shadow-sm border-0 skeleton-card">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center mb-3">
                        <div className="skeleton skeleton-avatar me-2" />
                        <div className="w-100">
                          <div className="skeleton skeleton-line w-55 mb-2" />
                          <div className="skeleton skeleton-line w-75" />
                        </div>
                      </div>
                      <div className="skeleton skeleton-line w-100 mb-2" />
                      <div className="skeleton skeleton-line w-90 mb-2" />
                      <div className="skeleton skeleton-line w-70" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : allTestimonials.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No testimonials yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <>
            {/* Row 1: Right → Left */}
            <div className="marquee-container">
              <div className="marquee-content marquee-rtl">
                {[...allTestimonials, ...allTestimonials].map((testimonial, index) => (
                  <div key={`${testimonial.id}-row1-${index}`} className="testimonial-card tilt-card">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: testimonial.color,
                              fontSize: "0.9rem",
                              flexShrink: 0,
                            }}
                          >
                            {testimonial.initials}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h6
                              className="mb-0 fw-bold text-truncate"
                              style={{ color: "#003087", fontSize: "0.9rem" }}
                            >
                              {testimonial.name}
                            </h6>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "0.75rem" }}>
                              {testimonial.section} • {testimonial.course}
                            </small>
                          </div>
                        </div>

                        <div className="mb-2 stars-animate">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className="bi bi-star-fill star-pop" />
                          ))}
                        </div>

                        <p className="card-text text-muted mb-0" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                          "{testimonial.feedback.length > 120 ? testimonial.feedback.substring(0, 120) + "..." : testimonial.feedback}"
                        </p>

                        {testimonial.isRealComment && (
                          <div className="mt-2">
                            <span className="badge bg-success" style={{ fontSize: "0.65rem" }}>
                              <i className="bi bi-check-circle me-1"></i>Community Feedback
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Row 2: Left → Right */}
            <div className="marquee-container mt-3">
              <div className="marquee-content marquee-ltr">
                {[...allTestimonials, ...allTestimonials].map((testimonial, index) => (
                  <div key={`${testimonial.id}-row2-${index}`} className="testimonial-card tilt-card">
                    <div className="card shadow-sm border-0 h-100">
                      <div className="card-body p-3">
                        <div className="d-flex align-items-center mb-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-2"
                            style={{
                              width: "40px",
                              height: "40px",
                              backgroundColor: testimonial.color,
                              fontSize: "0.9rem",
                              flexShrink: 0,
                            }}
                          >
                            {testimonial.initials}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <h6
                              className="mb-0 fw-bold text-truncate"
                              style={{ color: "#003087", fontSize: "0.9rem" }}
                            >
                              {testimonial.name}
                            </h6>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "0.75rem" }}>
                              {testimonial.section} • {testimonial.course}
                            </small>
                          </div>
                        </div>

                        <div className="mb-2 stars-animate">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className="bi bi-star-fill star-pop" />
                          ))}
                        </div>

                        <p className="card-text text-muted mb-0" style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                          "{testimonial.feedback.length > 120 ? testimonial.feedback.substring(0, 120) + "..." : testimonial.feedback}"
                        </p>

                        {testimonial.isRealComment && (
                          <div className="mt-2">
                            <span className="badge bg-success" style={{ fontSize: "0.65rem" }}>
                              <i className="bi bi-check-circle me-1"></i>Community Feedback
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* CTA Section */}
      <section
        className="py-5 text-center cta-animated-bg"
        style={{
          background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
        }}
      >
        <div className="container position-relative">
          {/* subtle floating particles */}
          <div className="cta-shapes" aria-hidden="true">
            <span className="cta-shape cta-s1" />
            <span className="cta-shape cta-s2" />
            <span className="cta-shape cta-s3" />
          </div>

          <h2 className="mb-3 text-white fw-bold display-5">Ready to Start Sharing?</h2>
          <p className="lead mb-4 text-white" style={{ opacity: 0.95 }}>
            Join the Niels Brock community and help reduce waste while helping fellow students!
          </p>

          {user ? (
            <Link
              to="/post"
              onClick={onRippleClick}
              className="btn btn-lg px-5 fw-bold shadow-lg cta-btn-glow position-relative overflow-hidden"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#003087",
                border: "3px solid #FFFFFF",
              }}
            >
              Post Your First Item
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={onRippleClick}
              className="btn btn-lg px-5 fw-bold shadow-lg cta-btn-glow position-relative overflow-hidden"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#003087",
                border: "3px solid #FFFFFF",
              }}
            >
              Login to Post
            </Link>
          )}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Page transition fade-in */
        html.page-fade-in body,
        html.page-fade-in #root {
          animation: pageFadeIn 600ms ease-out both;
        }
        html.page-fade-in-done body,
        html.page-fade-in-done #root {
          animation: none;
        }
        @keyframes pageFadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.001ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Banner Animations */
        @keyframes slideDownBanner {
          from {
            opacity: 0;
            transform: translateY(-100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .alert:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          transition: box-shadow 0.3s ease;
        }

        /* ---------------- HERO ---------------- */
        .hero-section {
          min-height: 520px;
          color: #fff;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(1200px 600px at 20% 10%, rgba(255, 255, 255, 0.16), transparent 60%),
            radial-gradient(900px 500px at 80% 30%, rgba(255, 255, 255, 0.12), transparent 62%),
            linear-gradient(120deg, #003087 0%, #00a9e0 45%, #2e7d32 100%);
          background-size: 180% 180%;
          animation: heroGradientShift 12s ease-in-out infinite;
          will-change: transform, background-position;
        }

        @keyframes heroGradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .hero-bottom-fade {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 90px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          will-change: transform;
        }

        /* Sequential text fade/slide */
        .hero-kicker-badge {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          opacity: 0;
          transform: translateY(10px);
          animation: heroIn 700ms ease-out 90ms forwards;
        }
        .hero-title {
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.02em;
          font-size: clamp(2rem, 3.6vw, 3.4rem);
          margin-bottom: 12px;
          opacity: 0;
          transform: translateY(16px);
          animation: heroIn 760ms ease-out 170ms forwards;
        }
        .hero-title-accent {
          display: inline-block;
          margin-left: 8px;
          opacity: 0.95;
        }
        .hero-subtitle {
          max-width: 680px;
          font-size: clamp(1rem, 1.2vw, 1.15rem);
          opacity: 0;
          transform: translateY(16px);
          animation: heroIn 760ms ease-out 270ms forwards;
        }

        .hero-cta-btn {
          border-radius: 14px;
          position: relative;
          opacity: 0;
          transform: translateY(14px);
          animation: heroIn 760ms ease-out 390ms forwards, ctaFloat 2.6s ease-in-out 1.2s infinite;
          will-change: transform;
        }
        .hero-secondary-btn {
          border-radius: 14px;
          opacity: 0;
          transform: translateY(14px);
          animation: heroIn 760ms ease-out 430ms forwards;
        }

        @keyframes heroIn {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ctaFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .hero-metrics .metric-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          font-weight: 600;
          font-size: 0.9rem;
          opacity: 0;
          transform: translateY(10px);
          animation: heroIn 760ms ease-out 520ms forwards;
        }

        .hero-panel {
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.10);
          border: 1px solid rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 20px 55px rgba(0, 0, 0, 0.18);
          overflow: hidden;
          opacity: 0;
          transform: translateY(18px);
          animation: heroIn 780ms ease-out 360ms forwards;
        }

        .hero-panel-top {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
        }
        .hero-panel-title {
          font-size: 0.9rem;
          font-weight: 700;
          opacity: 0.95;
        }
        .hero-panel-dot-group .dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          margin-right: 6px;
          opacity: 0.9;
        }
        .dot-1 {
          background: rgba(255, 255, 255, 0.55);
        }
        .dot-2 {
          background: rgba(255, 255, 255, 0.35);
        }
        .dot-3 {
          background: rgba(255, 255, 255, 0.2);
        }

        .hero-panel-body {
          padding: 14px;
        }
        .mini-list {
          display: grid;
          gap: 10px;
        }
        .mini-row {
          display: grid;
          grid-template-columns: 40px 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 10px 10px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          animation: miniPulse 3s ease-in-out infinite;
        }
        .mini-row:nth-child(2) {
          animation-delay: 250ms;
        }
        .mini-row:nth-child(3) {
          animation-delay: 500ms;
        }
        @keyframes miniPulse {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
        .mini-ic {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        .mini-txt .mini-line {
          height: 8px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.22);
          margin-bottom: 8px;
        }
        .mini-txt .mini-line.strong {
          width: 78%;
          background: rgba(255, 255, 255, 0.28);
        }
        .mini-txt .mini-line:not(.strong) {
          width: 58%;
        }
        .mini-pill {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .hero-panel-foot {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
          opacity: 0.95;
        }
        .pulse-indicator {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.55);
          animation: pulseRing 1.6s ease-out infinite;
        }
        @keyframes pulseRing {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.55);
            transform: scale(1);
          }
          70% {
            box-shadow: 0 0 0 14px rgba(255, 255, 255, 0);
            transform: scale(1.05);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
            transform: scale(1);
          }
        }

        .hero-note {
          color: rgba(255, 255, 255, 0.92);
          font-size: 0.92rem;
          opacity: 0;
          transform: translateY(10px);
          animation: heroIn 760ms ease-out 520ms forwards;
        }

        /* Floating geometric shapes */
        .hero-shapes .shape {
          position: absolute;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.14);
          filter: blur(0.2px);
          animation: floatShape 8s ease-in-out infinite;
          will-change: transform;
        }
        .shape-1 {
          width: 80px;
          height: 80px;
          top: 18%;
          left: 6%;
          animation-duration: 9s;
        }
        .shape-2 {
          width: 120px;
          height: 120px;
          top: 8%;
          right: 9%;
          border-radius: 28px;
          animation-duration: 11s;
        }
        .shape-3 {
          width: 70px;
          height: 70px;
          bottom: 18%;
          right: 22%;
          animation-duration: 10s;
        }
        .shape-4 {
          width: 110px;
          height: 110px;
          bottom: 12%;
          left: 18%;
          border-radius: 30px;
          animation-duration: 12s;
        }
        @keyframes floatShape {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(0, -14px, 0) rotate(6deg);
          }
        }

        /* ---------------- REVEAL / STAGGER ---------------- */
        .reveal-wrap > .col-md-4 {
          opacity: 0;
          transform: translateY(18px);
        }
        .reveal-wrap.show > .col-md-4:nth-child(1) {
          animation: fadeUp 650ms ease-out 0ms forwards;
        }
        .reveal-wrap.show > .col-md-4:nth-child(2) {
          animation: fadeUp 650ms ease-out 120ms forwards;
        }
        .reveal-wrap.show > .col-md-4:nth-child(3) {
          animation: fadeUp 650ms ease-out 240ms forwards;
        }
        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Icon subtle bounce/pulse */
        .icon-bounce {
          animation: iconBounce 2.2s ease-in-out infinite;
        }
        @keyframes iconBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        /* Hover: lift + shadow + slight rotation + scale */
        .reveal-wrap.show .col-md-4:hover {
          transform: translateY(-8px) rotate(-0.5deg) scale(1.01);
          transition: transform 220ms ease, box-shadow 220ms ease;
        }

        /* ---------------- PRODUCT CARDS ---------------- */
        .reveal-item {
          opacity: 0;
          transform: translateY(18px);
        }
        .reveal-item.show {
          animation: fadeUp 650ms ease-out forwards;
        }

        .product-card {
          transition: transform 220ms ease, box-shadow 220ms ease;
          border: none;
          border-radius: 12px;
          overflow: hidden;
          will-change: transform;
        }
        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14) !important;
        }

        /* Image zoom hover */
        .product-img-wrap {
          position: relative;
          overflow: hidden;
        }
        .product-img {
          transition: transform 320ms ease;
          will-change: transform;
        }
        .product-card:hover .product-img {
          transform: scale(1.06);
        }

        /* Badge slide-in from corner */
        .corner-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          transform: translate3d(30px, -30px, 0);
          opacity: 0;
          animation: badgeIn 520ms ease-out 240ms forwards;
          pointer-events: none;
        }
        @keyframes badgeIn {
          to {
            transform: translate3d(0, 0, 0);
            opacity: 1;
          }
        }

        /* Interested button grows on hover */
        .interested-btn {
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .interested-btn:hover {
          transform: scale(1.03);
          box-shadow: 0 10px 22px rgba(0, 0, 0, 0.12);
        }

        /* ---------------- CATEGORY WAVE ---------------- */
        .category-wave {
          opacity: 0;
          transform: translateY(18px);
        }
        .category-wave.show {
          animation: fadeUp 620ms ease-out forwards;
        }

        .category-card {
          transition: all 0.28s ease;
          border: none;
          border-radius: 12px;
          background: white;
          position: relative;
          overflow: hidden;
        }
        .category-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 25px rgba(0, 48, 135, 0.15) !important;
        }

        /* Overlay that slides in */
        .overlay-slide {
          position: absolute;
          inset: 0;
          transform: translateX(-102%);
          background: linear-gradient(90deg, rgba(0, 48, 135, 0.10), rgba(0, 169, 224, 0.10));
          transition: transform 320ms ease;
          pointer-events: none;
        }
        .category-card:hover .overlay-slide {
          transform: translateX(0);
        }

        /* Icon subtle pan/zoom feel (no images here; apply to icon) */
        .category-icon {
          transition: transform 320ms ease;
        }
        .category-card:hover .category-icon {
          transform: translateY(-2px) scale(1.06);
        }

        /* ---------------- STATS ---------------- */
        .stat-card {
          opacity: 0;
          transform: translateY(16px);
        }
        .stats-show .stat-card:nth-child(1) {
          animation: fadeUp 650ms ease-out 0ms forwards;
        }
        .stats-show .stat-card:nth-child(2) {
          animation: fadeUp 650ms ease-out 120ms forwards;
        }
        .stats-show .stat-card:nth-child(3) {
          animation: fadeUp 650ms ease-out 240ms forwards;
        }

        .stat-ic {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          margin: 0 auto 10px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 48, 135, 0.08);
          border: 1px solid rgba(0, 48, 135, 0.12);
          font-size: 1.4rem;
          color: #003087;
          transform: rotate(-6deg);
          opacity: 0.92;
        }
        .stats-show .stat-ic {
          animation: statIconIn 680ms ease-out forwards;
        }
        @keyframes statIconIn {
          0% {
            transform: translateY(8px) rotate(-10deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }

        .stat-progress {
          height: 10px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.06);
          max-width: 360px;
          margin: 10px auto 0 auto;
        }
        .stat-progress .progress-bar {
          border-radius: 999px;
          transition: width 900ms ease;
        }

        /* ---------------- FAQ ---------------- */
        .reveal-faq {
          opacity: 0;
          transform: translateY(16px);
        }
        .reveal-faq.show {
          animation: fadeUp 650ms ease-out forwards;
        }
        .faq-item {
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .faq-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(0, 0, 0, 0.08) !important;
        }

        /* ---------------- TESTIMONIALS ---------------- */
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        .marquee-content {
          display: flex;
          width: max-content;
          gap: 1rem;
          will-change: transform;
        }
        .marquee-rtl {
          animation: marquee-rtl 40s linear infinite;
        }
        .marquee-ltr {
          transform: translateX(-50%);
          animation: marquee-ltr 40s linear infinite;
        }

        @keyframes marquee-rtl {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-ltr {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .testimonial-card {
          min-width: 280px;
          max-width: 280px;
        }
        @media (max-width: 768px) {
          .testimonial-card {
            min-width: 240px;
            max-width: 240px;
          }
        }
        @media (max-width: 480px) {
          .testimonial-card {
            min-width: 220px;
            max-width: 220px;
          }
        }

        /* Tilt on hover */
        .tilt-card .card {
          transition: transform 240ms ease, box-shadow 240ms ease;
          transform: perspective(900px) rotateX(0deg) rotateY(0deg);
          will-change: transform;
        }
        .tilt-card:hover .card {
          transform: perspective(900px) rotateX(2deg) rotateY(-3deg) translateY(-4px);
          box-shadow: 0 18px 35px rgba(0, 0, 0, 0.12);
        }

        /* Smooth pause on hover */
        .marquee-content:hover {
          animation-play-state: paused;
        }

        /* Star ratings animate in */
        .stars-animate .star-pop {
          color: #ffd700;
          font-size: 0.75rem;
          display: inline-block;
          transform: scale(0.7);
          opacity: 0;
          animation: starPop 520ms ease-out forwards;
        }
        .stars-animate .star-pop:nth-child(1) {
          animation-delay: 30ms;
        }
        .stars-animate .star-pop:nth-child(2) {
          animation-delay: 70ms;
        }
        .stars-animate .star-pop:nth-child(3) {
          animation-delay: 110ms;
        }
        .stars-animate .star-pop:nth-child(4) {
          animation-delay: 150ms;
        }
        .stars-animate .star-pop:nth-child(5) {
          animation-delay: 190ms;
        }
        @keyframes starPop {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Smooth text rendering */
        .testimonial-card .card-text {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }

        /* ---------------- CTA ---------------- */
        .cta-animated-bg {
          position: relative;
          overflow: hidden;
        }
        .cta-shapes .cta-shape {
          position: absolute;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.18);
          animation: floatShape 10s ease-in-out infinite;
          pointer-events: none;
        }
        .cta-s1 {
          width: 90px;
          height: 90px;
          left: 8%;
          top: 20%;
          animation-duration: 12s;
        }
        .cta-s2 {
          width: 120px;
          height: 120px;
          right: 10%;
          top: 12%;
          border-radius: 28px;
          animation-duration: 14s;
        }
        .cta-s3 {
          width: 80px;
          height: 80px;
          right: 24%;
          bottom: 12%;
          animation-duration: 11s;
        }

        /* Pulsing glow effect on buttons */
        .cta-btn-glow {
          border-radius: 14px;
          position: relative;
          animation: glowPulse 2.8s ease-in-out infinite;
        }
        @keyframes glowPulse {
          0%,
          100% {
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.18);
          }
          50% {
            box-shadow: 0 16px 42px rgba(255, 255, 255, 0.30);
          }
        }

        /* ---------------- MICRO-INTERACTIONS ---------------- */
        .micro-btn {
          position: relative;
          overflow: hidden;
          transition: transform 220ms ease, box-shadow 220ms ease;
          will-change: transform;
        }
        .micro-btn:hover {
          transform: translateY(-2px);
        }

        /* Ripple element */
        .ripple {
          position: absolute;
          border-radius: 50%;
          transform: scale(0);
          background: rgba(255, 255, 255, 0.45);
          animation: rippleAnim 650ms ease-out;
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        @keyframes rippleAnim {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        /* ---------------- SKELETONS ---------------- */
        .skeleton-card {
          border-radius: 14px;
          overflow: hidden;
        }
        .skeleton {
          background: linear-gradient(
            90deg,
            rgba(0, 0, 0, 0.06) 25%,
            rgba(0, 0, 0, 0.10) 37%,
            rgba(0, 0, 0, 0.06) 63%
          );
          background-size: 400% 100%;
          animation: skeletonShimmer 1.25s ease-in-out infinite;
          border-radius: 10px;
        }
        @keyframes skeletonShimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: 0 0;
          }
        }
        .skeleton-img {
          height: 150px;
          border-radius: 0;
        }
        .skeleton-line {
          height: 10px;
        }
        .skeleton-pill {
          height: 22px;
          border-radius: 999px;
        }
        .skeleton-btn {
          height: 34px;
          border-radius: 10px;
        }
        .skeleton-avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
        }

        /* Mobile-friendly hero spacing */
        @media (max-width: 992px) {
          .hero-section {
            min-height: 560px;
          }
          .hero-panel {
            margin-top: 14px;
          }
        }

        /* Keep existing accordion focus styles clean */
        .accordion-button:not(.collapsed) {
          box-shadow: none;
        }
        .accordion-button:focus {
          box-shadow: none;
          border-color: transparent;
        }
      `}</style>
    </div>
  );
}

export default Home;
