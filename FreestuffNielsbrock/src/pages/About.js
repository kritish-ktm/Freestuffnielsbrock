// src/pages/About.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

function About() {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({ type: '', text: '' });

  // Show toast notification
  const showNotification = (type, text) => {
    setToastMessage({ type, text });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("page", "about")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showNotification('warning', 'Please login to leave a comment');
      return;
    }

    if (!newComment.trim()) {
      showNotification('warning', 'Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("comments")
        .insert([{
          page: "about",
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Anonymous",
          user_email: user.email,
          comment: newComment.trim(),
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;

      setNewComment("");
      fetchComments();
      showNotification('success', 'Comment posted successfully!');
    } catch (error) {
      console.error("Error posting comment:", error);
      showNotification('error', 'Error posting comment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div>
        {/* Hero Section */}
        <section
          className="py-5 text-center"
          style={{
            background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
            color: "white",
            animation: 'fadeIn 0.6s ease-in'
          }}
        >
          <div className="container">
            <h1 className="display-4 fw-bold mb-3" style={{ animation: 'slideDown 0.6s ease-out' }}>
              About Free Stuff Marketplace
            </h1>
            <p className="lead" style={{ animation: 'slideDown 0.8s ease-out' }}>
              Why this platform was created and its mission
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center g-4">
              <div className="col-lg-6" style={{ animation: 'slideInLeft 0.8s ease-out' }}>
                <h2 style={{ color: "#003087" }} className="fw-bold mb-4">
                  <i className="bi bi-bullseye me-3" style={{ fontSize: '2rem' }}></i>
                  The Story
                </h2>
                <p className="lead text-muted mb-3">
                  Free Stuff Marketplace is a student-led project born from a simple observation: Niels Brock students have tons of items they no longer need, while others are constantly searching for affordable alternatives.
                </p>
                <p className="text-muted mb-3">
                  Creating a community-driven platform solves two problems at once:
                </p>
                <ul className="text-muted">
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Reduce Waste:</strong> Give items a second life instead of throwing them away
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Save Money:</strong> Students can find quality items for free or cheap
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Build Community:</strong> Connect with fellow Niels Brock students
                  </li>
                </ul>
              </div>
              <div className="col-lg-6" style={{ animation: 'slideInRight 0.8s ease-out' }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "15px",
                    padding: "40px",
                    textAlign: "center",
                    color: "white",
                    minHeight: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div>
                    <i className="bi bi-lightbulb-fill" style={{ fontSize: "4rem", marginBottom: "20px" }}></i>
                    <h3>"Every item has a story, and the platform helps write the next chapter"</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <h2 style={{ color: "#003087", animation: 'fadeIn 1s ease-in' }} className="fw-bold text-center mb-5">
              <i className="bi bi-recycle me-3" style={{ fontSize: '2.5rem' }}></i>
              Sustainability & Environmental Impact
            </h2>
            <div className="row g-4">
              <div className="col-md-4" style={{ animation: 'fadeInUp 0.8s ease-out' }}>
                <div className="card h-100 border-0 shadow-sm p-4" style={{ transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#28a745",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.8rem",
                      marginBottom: "20px",
                    }}
                  >
                    <i className="bi bi-globe2"></i>
                  </div>
                  <h5 className="fw-bold">Reduce Landfill Waste</h5>
                  <p className="text-muted">
                    Every item shared prevents unnecessary waste in landfills. By giving items a second life, the platform reduces environmental impact.
                  </p>
                </div>
              </div>
              <div className="col-md-4" style={{ animation: 'fadeInUp 1s ease-out' }}>
                <div className="card h-100 border-0 shadow-sm p-4" style={{ transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#17a2b8",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.8rem",
                      marginBottom: "20px",
                    }}
                  >
                    <i className="bi bi-tree-fill"></i>
                  </div>
                  <h5 className="fw-bold">Lower Carbon Footprint</h5>
                  <p className="text-muted">
                    By promoting reuse over purchasing new items, the website significantly reduces carbon emissions from production and shipping.
                  </p>
                </div>
              </div>
              <div className="col-md-4" style={{ animation: 'fadeInUp 1.2s ease-out' }}>
                <div className="card h-100 border-0 shadow-sm p-4" style={{ transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      backgroundColor: "#ffc107",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "1.8rem",
                      marginBottom: "20px",
                    }}
                  >
                    <i className="bi bi-heart-fill"></i>
                  </div>
                  <h5 className="fw-bold">Circular Economy</h5>
                  <p className="text-muted">
                    This platform promotes a circular economy where items keep circulating in the community instead of being discarded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Helping Newcomers Section */}
        <section className="py-5">
          <div className="container">
            <h2 style={{ color: "#003087", animation: 'fadeIn 1s ease-in' }} className="fw-bold text-center mb-5">
              <i className="bi bi-hand-thumbs-up-fill me-3" style={{ fontSize: '2.5rem' }}></i>
              Helping Newcomers & Students
            </h2>
            <div className="row g-4">
              <div className="col-lg-6" style={{ animation: 'slideInLeft 0.8s ease-out' }}>
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderLeft: "5px solid #003087", transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-person-badge me-2"></i>
                    For New Students
                  </h5>
                  <p className="text-muted mb-3">
                    Moving to a new city or country is expensive! Free Stuff Marketplace helps newcomers find furniture, electronics, and other essentials without breaking the bank.
                  </p>
                  <ul className="text-muted">
                    <li><i className="bi bi-check-circle-fill text-primary me-2"></i>Find affordable furniture for your dorm</li>
                    <li><i className="bi bi-check-circle-fill text-primary me-2"></i>Get textbooks and study materials</li>
                    <li><i className="bi bi-check-circle-fill text-primary me-2"></i>Connect with the community</li>
                    <li><i className="bi bi-check-circle-fill text-primary me-2"></i>Save hundreds of DKK</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-6" style={{ animation: 'slideInRight 0.8s ease-out' }}>
                <div className="card border-0 shadow-sm p-4 h-100" style={{ borderLeft: "5px solid #00A9E0", transition: 'transform 0.3s ease' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(10px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-piggy-bank me-2"></i>
                    Financial Relief
                  </h5>
                  <p className="text-muted mb-3">
                    Student life comes with limited budgets. This platform provides access to free and cheap items, allowing students to allocate their resources to education and experiences.
                  </p>
                  <ul className="text-muted">
                    <li><i className="bi bi-check-circle-fill text-info me-2"></i>100% free items available</li>
                    <li><i className="bi bi-check-circle-fill text-info me-2"></i>No shipping costs (local pickup)</li>
                    <li><i className="bi bi-check-circle-fill text-info me-2"></i>Quality items from fellow students</li>
                    <li><i className="bi bi-check-circle-fill text-info me-2"></i>Budget-friendly alternative to retail</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <h2 style={{ color: "#003087", animation: 'fadeIn 1s ease-in' }} className="fw-bold text-center mb-5">
              <i className="bi bi-people-fill me-3" style={{ fontSize: '2.5rem' }}></i>
              Building a Shared Community
            </h2>
            <div className="row g-4 align-items-center">
              <div className="col-lg-6" style={{ animation: 'slideInLeft 0.8s ease-out' }}>
                <h4 className="fw-bold mb-3">More Than Just a Marketplace</h4>
                <p className="text-muted mb-3">
                  Free Stuff Marketplace is about building relationships and trust within the Niels Brock community. When someone gives away an item, they're not just decluttering—they're helping a fellow student.
                </p>
                <p className="text-muted mb-3">
                  The platform encourages:
                </p>
                <ul className="text-muted">
                  <li className="mb-2">
                    <i className="bi bi-shield-check text-success me-2"></i>
                    <strong>Trust & Safety:</strong> All members are Niels Brock students, creating a safe environment
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-gift text-danger me-2"></i>
                    <strong>Generosity:</strong> The joy of giving and helping others succeed
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-diagram-3 text-primary me-2"></i>
                    <strong>Collaboration:</strong> Working together to reduce waste and support each other
                  </li>
                  <li>
                    <i className="bi bi-brightness-high text-warning me-2"></i>
                    <strong>Sustainability Mindset:</strong> Inspiring others to think about environmental impact
                  </li>
                </ul>
              </div>
              <div className="col-lg-6" style={{ animation: 'slideInRight 0.8s ease-out' }}>
                <div
                  style={{
                    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    borderRadius: "15px",
                    padding: "40px",
                    textAlign: "center",
                    color: "white",
                    minHeight: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: 'transform 0.3s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div>
                    <i className="bi bi-people-fill" style={{ fontSize: "4rem", marginBottom: "20px" }}></i>
                    <h3>"Together, the community creates a stronger, more sustainable future"</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comments Section */}
        <section className="py-5">
          <div className="container" style={{ maxWidth: "700px", animation: 'fadeIn 1s ease-in' }}>
            <h2 style={{ color: "#003087" }} className="fw-bold text-center mb-4">
              <i className="bi bi-chat-dots-fill me-3" style={{ fontSize: '2rem' }}></i>
              What the Community Says
            </h2>

            {/* Comment Form */}
            {user ? (
              <div className="card shadow-sm border-0 p-4 mb-5" style={{ animation: 'slideDown 0.6s ease-out' }}>
                <h5 className="fw-bold mb-3">
                  <i className="bi bi-pencil-square me-2"></i>
                  Leave Your Comment
                </h5>
                <form onSubmit={handleCommentSubmit}>
                  <div className="mb-3">
                    <textarea
                      className="form-control form-control-lg"
                      rows="4"
                      placeholder="What do you think about this initiative? Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={submitting}
                      style={{ transition: 'border-color 0.3s ease' }}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={submitting}
                    style={{ transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Posting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send-fill me-2"></i>
                        Post Comment
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="alert alert-info text-center mb-5" style={{ animation: 'slideDown 0.6s ease-out' }}>
                <i className="bi bi-info-circle-fill me-2"></i>
                <strong>Login to leave a comment!</strong> Sign in to share your thoughts about the community.
              </div>
            )}

            {/* Comments List */}
            <div>
              <h5 className="fw-bold mb-4">
                <i className="bi bi-chat-left-text me-2"></i>
                {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
              </h5>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading comments...</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="alert alert-secondary text-center" style={{ animation: 'fadeIn 0.5s ease-in' }}>
                  <i className="bi bi-chat-square-dots me-2"></i>
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                comments.map((comment, index) => (
                  <div 
                    key={comment.id} 
                    className="card border-0 shadow-sm p-4 mb-3"
                    style={{ 
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s backwards`,
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div className="d-flex align-items-start">
                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          backgroundColor: "#003087",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          marginRight: "15px",
                          flexShrink: 0,
                        }}
                      >
                        <i className="bi bi-person-fill"></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-bold mb-1">{comment.user_name}</h6>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(comment.created_at).toLocaleDateString()} at{" "}
                          {new Date(comment.created_at).toLocaleTimeString()}
                        </p>
                        <p className="text-dark">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className="py-5 text-center"
          style={{
            background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
            color: "white",
            animation: 'fadeIn 1s ease-in'
          }}
        >
          <div className="container">
            <h2 className="fw-bold mb-3">Join the Movement</h2>
            <p className="lead mb-4">
              Be part of a community that cares about sustainability and helping others
            </p>
            <a 
              href="/products" 
              className="btn btn-light btn-lg px-5"
              style={{ transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <i className="bi bi-shop me-2"></i>Start Browsing
            </a>
          </div>
        </section>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div 
          className="position-fixed top-50 start-50 translate-middle"
          style={{ 
            zIndex: 9999,
            animation: 'fadeInScale 0.3s ease-out',
            width: '90%',
            maxWidth: '400px'
          }}
        >
          <div 
            className={`alert alert-${
              toastMessage.type === 'success' ? 'success' : 
              toastMessage.type === 'error' ? 'danger' : 
              toastMessage.type === 'warning' ? 'warning' : 
              'info'
            } d-flex align-items-center shadow-lg mb-0`}
            role="alert"
            style={{
              borderRadius: '10px',
              border: 'none',
              padding: '1rem 1.5rem'
            }}
          >
            <i className={`bi ${
              toastMessage.type === 'success' ? 'bi-check-circle-fill' : 
              toastMessage.type === 'error' ? 'bi-x-circle-fill' : 
              toastMessage.type === 'warning' ? 'bi-exclamation-triangle-fill' : 
              'bi-info-circle-fill'
            } me-3`} style={{ fontSize: '2rem' }}></i>
            <div className="flex-grow-1">{toastMessage.text}</div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
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
      `}</style>
    </>
  );
}

export default About;
