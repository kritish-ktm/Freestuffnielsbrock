// src/pages/Home.js
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

/** Small IntersectionObserver hook (like About page behavior, but on scroll) */
function useRevealOnScroll(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShow(true);
        io.disconnect();
      }
    }, options);

    io.observe(el);
    return () => io.disconnect();
  }, [options]);

  return { ref, show };
}

function Home() {
  const { user } = useAuth();
  const [latestItems, setLatestItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFAQ, setOpenFAQ] = useState(null);
  const [communityComments, setCommunityComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  // Page "first open" animation trigger
  const [pageReady, setPageReady] = useState(false);

  // Scroll reveals (keep sections same, just wrap with show class)
  const howRef = useRevealOnScroll({ threshold: 0.2 });
  const latestRef = useRevealOnScroll({ threshold: 0.12 });
  const catRef = useRevealOnScroll({ threshold: 0.15 });
  const statsRef = useRevealOnScroll({ threshold: 0.2 });
  const faqRef = useRevealOnScroll({ threshold: 0.15 });
  const testiRef = useRevealOnScroll({ threshold: 0.12 });

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
      feedback:
        "Great community! Everyone is friendly and responsive. Got furniture for my dorm room!",
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

  useEffect(() => {
    fetchLatestItems();
    fetchCommunityComments();

    // "first open" zoom-in/zoom-out feel (like your About page style)
    const t = setTimeout(() => setPageReady(true), 30);
    return () => clearTimeout(t);
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
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);

        return {
          id: `comment-${comment.id}`,
          name: comment.user_name,
          section: "Community Member",
          course: "Niels Brock Student",
          feedback: comment.comment,
          initials,
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

  const allTestimonials = [...staticTestimonials, ...communityComments];

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

  return (
    <div className={`home-page ${pageReady ? "page-ready" : ""}`}>
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

      {/* HERO (same CTA idea, just pop animations) */}
      <section
        className="py-5 text-center hero-simple"
        style={{
          background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
          color: "white",
        }}
      >
        <div className="container">
          <h1 className="display-4 fw-bold mb-3 hero-pop hero-delay-1">
            Free Stuff Marketplace
          </h1>
          <p className="lead hero-pop hero-delay-2">
            Share and find items within the Niels Brock student community
          </p>

          <div className="mt-4 hero-pop hero-delay-3">
            {user ? (
              <Link
                to="/post"
                className="btn btn-light btn-lg px-5 hero-cta"
                style={{ color: "#003087", fontWeight: 700 }}
              >
                <i className="bi bi-upload me-2"></i>
                Post an Item
              </Link>
            ) : (
              <Link
                to="/login"
                className="btn btn-light btn-lg px-5 hero-cta"
                style={{ color: "#003087", fontWeight: 700 }}
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login to Post
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light">
        <div className="container" ref={howRef.ref}>
          <h2 className="text-center mb-5" style={{ color: "#003087" }}>
            How It Works
          </h2>

          <div className={`row g-4 ${howRef.show ? "reveal-show" : "reveal-hide"}`}>
            <div className="col-md-4 text-center reveal-item" style={{ animationDelay: "0ms" }}>
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-pulse"
                style={{ width: "80px", height: "80px", backgroundColor: "#003087" }}
              >
                <i className="bi bi-upload" style={{ fontSize: "2rem" }}></i>
              </div>
              <h4 style={{ color: "#003087" }}>1. Post Your Item</h4>
              <p className="text-muted">List items you no longer need. It's quick, easy, and free!</p>
            </div>

            <div className="col-md-4 text-center reveal-item" style={{ animationDelay: "120ms" }}>
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-pulse"
                style={{ width: "80px", height: "80px", backgroundColor: "#00A9E0" }}
              >
                <i className="bi bi-search" style={{ fontSize: "2rem" }}></i>
              </div>
              <h4 style={{ color: "#003087" }}>2. Browse Items</h4>
              <p className="text-muted">Search through items posted by fellow students.</p>
            </div>

            <div className="col-md-4 text-center reveal-item" style={{ animationDelay: "240ms" }}>
              <div
                className="feature-icon text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 icon-pulse"
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
        <div className="container" ref={latestRef.ref}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 style={{ color: "#003087" }}>Latest Items</h2>
            <Link
              to="/products"
              className="btn btn-outline-primary border-2 micro-btn"
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
                <Link to="/post" className="btn btn-success mt-3 micro-btn">
                  Post an Item
                </Link>
              )}
            </div>
          ) : (
            <div className="row g-3">
              {latestItems.map((product, idx) => (
                <div
                  key={product.id}
                  className={`col-lg-4 col-md-4 col-sm-6 mb-4 ${
                    latestRef.show ? "reveal-card" : "reveal-card-hidden"
                  }`}
                  style={{ animationDelay: `${idx * 90}ms` }}
                >
                  <div className="card h-100 shadow-sm product-card">
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

                      {/* Simple badge slide-in */}
                      <span className={`price-badge ${latestRef.show ? "badge-in" : ""}`}>
                        {product.price === 0 ? "FREE" : `${product.price} DKK`}
                      </span>
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

                        <Link to={`/product/${product.id}`} className="btn btn-outline-primary btn-sm w-100 micro-btn grow-btn">
                          <i className="bi bi-eye me-2"></i>
                          View Details
                        </Link>

                        {user && product.posted_by === user.id && (
                          <button className="btn btn-danger btn-sm w-100 mt-2 micro-btn" onClick={() => handleLiveDelete(product.id)}>
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
      <section className="py-5">
        <div className="container" ref={catRef.ref}>
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
                className={`col-md-2 col-sm-4 col-6 ${catRef.show ? "reveal-card" : "reveal-card-hidden"}`}
                style={{ animationDelay: `${i * 70}ms` }}
              >
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
      <section className="py-5 bg-light">
        <div className="container" ref={statsRef.ref}>
          <div className={`row text-center ${statsRef.show ? "reveal-show" : "reveal-hide"}`}>
            <div className="col-md-4 mb-4 reveal-item" style={{ animationDelay: "0ms" }}>
              <h2 className="display-4 fw-bold" style={{ color: "#003087" }}>
                {latestItems.length > 0 ? `${latestItems.length * 10}+` : "0"}
              </h2>
              <p className="text-muted">Items Shared</p>
            </div>
            <div className="col-md-4 mb-4 reveal-item" style={{ animationDelay: "120ms" }}>
              <h2 className="display-4 fw-bold" style={{ color: "#00A9E0" }}>
                50+
              </h2>
              <p className="text-muted">Active Students</p>
            </div>
            <div className="col-md-4 mb-4 reveal-item" style={{ animationDelay: "240ms" }}>
              <h2 className="display-4 fw-bold" style={{ color: "#D4AF37" }}>
                100%
              </h2>
              <p className="text-muted">Free to Use</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-5">
        <div className="container" style={{ maxWidth: "800px" }} ref={faqRef.ref}>
          <h2 className="text-center mb-5" style={{ color: "#003087" }}>
            Frequently Asked Questions
          </h2>

          <div className={`accordion ${faqRef.show ? "reveal-fade" : "reveal-fade-hidden"}`} id="faqAccordion">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="accordion-item border-0 shadow-sm mb-3"
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

      {/* Testimonials Section */}
      <section className="py-5 bg-light overflow-hidden">
        <div className="container" ref={testiRef.ref}>
          <h2 className="text-center mb-2" style={{ color: "#003087" }}>
            What Students Say
          </h2>
          <p className="text-center text-muted mb-5">
            <small>Real feedback from our community members</small>
          </p>
        </div>

        {commentsLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading testimonials...</span>
            </div>
          </div>
        ) : allTestimonials.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No testimonials yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className={`${testiRef.show ? "reveal-fade" : "reveal-fade-hidden"}`}>
            {/* Row 1 */}
            <div className="marquee-container">
              <div className="marquee-content marquee-rtl">
                {[...allTestimonials, ...allTestimonials].map((testimonial, index) => (
                  <div key={`${testimonial.id}-row1-${index}`} className="testimonial-card">
                    <div className="card shadow-sm border-0 h-100 t-hover">
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
                            <h6 className="mb-0 fw-bold text-truncate" style={{ color: "#003087", fontSize: "0.9rem" }}>
                              {testimonial.name}
                            </h6>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "0.75rem" }}>
                              {testimonial.section} • {testimonial.course}
                            </small>
                          </div>
                        </div>

                        <div className="mb-2 stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className="bi bi-star-fill"></i>
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

            {/* Row 2 */}
            <div className="marquee-container mt-3">
              <div className="marquee-content marquee-ltr">
                {[...allTestimonials, ...allTestimonials].map((testimonial, index) => (
                  <div key={`${testimonial.id}-row2-${index}`} className="testimonial-card">
                    <div className="card shadow-sm border-0 h-100 t-hover">
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
                            <h6 className="mb-0 fw-bold text-truncate" style={{ color: "#003087", fontSize: "0.9rem" }}>
                              {testimonial.name}
                            </h6>
                            <small className="text-muted d-block text-truncate" style={{ fontSize: "0.75rem" }}>
                              {testimonial.section} • {testimonial.course}
                            </small>
                          </div>
                        </div>

                        <div className="mb-2 stars">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i key={star} className="bi bi-star-fill"></i>
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
          </div>
        )}
      </section>

      {/* CTA Section (same as yours) */}
      <section
        className="py-5 text-center"
        style={{
          background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
        }}
      >
        <div className="container">
          <h2 className="mb-3 text-white fw-bold display-5">Ready to Start Sharing?</h2>
          <p className="lead mb-4 text-white" style={{ opacity: 0.95 }}>
            Join the Niels Brock community and help reduce waste while helping fellow students!
          </p>

          {user ? (
            <Link
              to="/post"
              className="btn btn-lg px-5 fw-bold shadow-lg micro-btn"
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
              className="btn btn-lg px-5 fw-bold shadow-lg micro-btn"
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
        /* --- Page first open: zoom-out + fade-in (subtle) --- */
        .home-page {
          opacity: 0;
          transform: scale(0.985);
          transition: opacity 520ms ease, transform 520ms ease;
        }
        .home-page.page-ready {
          opacity: 1;
          transform: scale(1);
        }

        /* --- Hero pop sequence (like About.js feel) --- */
        .hero-pop {
          opacity: 0;
          transform: translateY(18px);
          animation: heroPop 680ms ease-out forwards;
        }
        .hero-delay-1 {
          animation-delay: 80ms;
        }
        .hero-delay-2 {
          animation-delay: 220ms;
        }
        .hero-delay-3 {
          animation-delay: 360ms;
        }
        @keyframes heroPop {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* CTA float tiny (optional, not too much) */
        .hero-cta {
          transition: transform 220ms ease, box-shadow 220ms ease;
          border-radius: 14px;
        }
        .hero-cta:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
        }

        /* --- Scroll reveal helpers --- */
        .reveal-hide .reveal-item {
          opacity: 0;
          transform: translateY(16px);
        }
        .reveal-show .reveal-item {
          animation: fadeInUp 650ms ease-out forwards;
        }

        .reveal-card-hidden {
          opacity: 0;
          transform: translateY(16px);
        }
        .reveal-card {
          animation: fadeInUp 650ms ease-out forwards;
        }

        .reveal-fade-hidden {
          opacity: 0;
          transform: translateY(10px);
        }
        .reveal-fade {
          animation: fadeIn 600ms ease-out forwards;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* --- Micro interactions (light) --- */
        .micro-btn {
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .micro-btn:hover {
          transform: translateY(-2px);
        }

        /* Feature icon subtle pulse */
        .icon-pulse {
          animation: iconPulse 1.9s ease-in-out infinite;
        }
        @keyframes iconPulse {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        /* Product card hover (same as you had, slightly smoother) */
        .product-card {
          transition: transform 220ms ease, box-shadow 220ms ease;
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 26px rgba(0, 0, 0, 0.14) !important;
        }

        /* Image zoom on hover */
        .product-img-wrap {
          position: relative;
          overflow: hidden;
        }
        .product-img {
          transition: transform 320ms ease;
        }
        .product-card:hover .product-img {
          transform: scale(1.06);
        }

        /* Price badge slide-in */
        .price-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.92);
          color: #003087;
          border: 1px solid rgba(0, 48, 135, 0.18);
          font-weight: 800;
          font-size: 0.75rem;
          padding: 6px 10px;
          border-radius: 999px;
          transform: translate(18px, -18px);
          opacity: 0;
          transition: opacity 400ms ease, transform 400ms ease;
          pointer-events: none;
        }
        .badge-in {
          opacity: 1;
          transform: translate(0, 0);
        }

        /* "Interested"/View button grows */
        .grow-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }

        /* Category hover (already in your file; keep simple) */
        .category-card {
          transition: all 0.28s ease;
          border-radius: 12px;
          background: white;
        }
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 25px rgba(0, 48, 135, 0.15) !important;
        }

        /* Testimonials hover */
        .t-hover {
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .t-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 28px rgba(0, 0, 0, 0.12);
        }

        /* Stars (simple fade) */
        .stars i {
          color: #ffd700;
          font-size: 0.75rem;
          opacity: 0;
          animation: starFade 450ms ease-out forwards;
        }
        .stars i:nth-child(1) {
          animation-delay: 40ms;
        }
        .stars i:nth-child(2) {
          animation-delay: 80ms;
        }
        .stars i:nth-child(3) {
          animation-delay: 120ms;
        }
        .stars i:nth-child(4) {
          animation-delay: 160ms;
        }
        .stars i:nth-child(5) {
          animation-delay: 200ms;
        }
        @keyframes starFade {
          to {
            opacity: 1;
          }
        }

        /* Marquee (your same style) */
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        .marquee-content {
          display: flex;
          width: max-content;
          gap: 1rem;
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

        /* Banner Animations (same as before) */
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

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
          .home-page {
            opacity: 1 !important;
            transform: none !important;
          }
          .price-badge {
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
