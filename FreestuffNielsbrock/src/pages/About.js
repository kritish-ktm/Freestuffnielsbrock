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
      alert("Please login to leave a comment");
      return;
    }

    if (!newComment.trim()) {
      alert("Please write a comment");
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
      alert("✅ Comment posted successfully!");
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("❌ Error posting comment: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="py-5 text-center"
        style={{
          background: "linear-gradient(135deg, #003087 0%, #00A9E0 100%)",
          color: "white",
        }}
      >
        <div className="container">
          <h1 className="display-4 fw-bold mb-3">About Free Stuff Marketplace</h1>
          <p className="lead">Why this platform was created and its mission</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <h2 style={{ color: "#003087" }} className="fw-bold mb-4">
                🎯 The Story
              </h2>
              <p className="lead text-muted mb-3">
                Free Stuff Marketplace is a student-led project born from a simple observation: Niels Brock students have tons of items they no longer need, while others are constantly searching for affordable alternatives.
              </p>
              <p className="text-muted mb-3">
                Creating a community-driven platform solves two problems at once:
              </p>
              <ul className="text-muted">
                <li className="mb-2"><strong>✓ Reduce Waste:</strong> Give items a second life instead of throwing them away</li>
                <li className="mb-2"><strong>✓ Save Money:</strong> Students can find quality items for free or cheap</li>
                <li><strong>✓ Build Community:</strong> Connect with fellow Niels Brock students</li>
              </ul>
            </div>
            <div className="col-lg-6">
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
                }}
              >
                <div>
                  <i className="bi bi-lightbulb" style={{ fontSize: "4rem", marginBottom: "20px" }}></i>
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
          <h2 style={{ color: "#003087" }} className="fw-bold text-center mb-5">
            ♻️ Sustainability & Environmental Impact
          </h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4">
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
                  <i className="bi bi-globe"></i>
                </div>
                <h5 className="fw-bold">Reduce Landfill Waste</h5>
                <p className="text-muted">
                  Every item shared prevents unnecessary waste in landfills. By giving items a second life, the platform reduces environmental impact.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4">
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
                  <i className="bi bi-tree"></i>
                </div>
                <h5 className="fw-bold">Lower Carbon Footprint</h5>
                <p className="text-muted">
                  By promoting reuse over purchasing new items, the website significantly reduces carbon emissions from production and shipping.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm p-4">
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
                  <i className="bi bi-heart"></i>
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
          <h2 style={{ color: "#003087" }} className="fw-bold text-center mb-5">
            👋 Helping Newcomers & Students
          </h2>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100" style={{ borderLeft: "5px solid #003087" }}>
                <h5 className="fw-bold mb-3">For New Students</h5>
                <p className="text-muted mb-3">
                  Moving to a new city or country is expensive! Free Stuff Marketplace helps newcomers find furniture, electronics, and other essentials without breaking the bank.
                </p>
                <ul className="text-muted">
                  <li>✓ Find affordable furniture for your dorm</li>
                  <li>✓ Get textbooks and study materials</li>
                  <li>✓ Connect with the community</li>
                  <li>✓ Save hundreds of DKK</li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm p-4 h-100" style={{ borderLeft: "5px solid #00A9E0" }}>
                <h5 className="fw-bold mb-3">Financial Relief</h5>
                <p className="text-muted mb-3">
                  Student life comes with limited budgets. This platform provides access to free and cheap items, allowing students to allocate their resources to education and experiences.
                </p>
                <ul className="text-muted">
                  <li>✓ 100% free items available</li>
                  <li>✓ No shipping costs (local pickup)</li>
                  <li>✓ Quality items from fellow students</li>
                  <li>✓ Budget-friendly alternative to retail</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 style={{ color: "#003087" }} className="fw-bold text-center mb-5">
            🤝 Building a Shared Community
          </h2>
          <div className="row g-4 align-items-center">
            <div className="col-lg-6">
              <h4 className="fw-bold mb-3">More Than Just a Marketplace</h4>
              <p className="text-muted mb-3">
                Free Stuff Marketplace is about building relationships and trust within the Niels Brock community. When someone gives away an item, they're not just decluttering—they're helping a fellow student.
              </p>
              <p className="text-muted mb-3">
                The platform encourages:
              </p>
              <ul className="text-muted">
                <li className="mb-2"><strong>Trust & Safety:</strong> All members are Niels Brock students, creating a safe environment</li>
                <li className="mb-2"><strong>Generosity:</strong> The joy of giving and helping others succeed</li>
                <li className="mb-2"><strong>Collaboration:</strong> Working together to reduce waste and support each other</li>
                <li><strong>Sustainability Mindset:</strong> Inspiring others to think about environmental impact</li>
              </ul>
            </div>
            <div className="col-lg-6">
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
                }}
              >
                <div>
                  <i className="bi bi-people" style={{ fontSize: "4rem", marginBottom: "20px" }}></i>
                  <h3>"Together, the community creates a stronger, more sustainable future"</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="py-5">
        <div className="container" style={{ maxWidth: "700px" }}>
          <h2 style={{ color: "#003087" }} className="fw-bold text-center mb-4">
            💬 What the Community Says
          </h2>

          {/* Comment Form */}
          {user ? (
            <div className="card shadow-sm border-0 p-4 mb-5">
              <h5 className="fw-bold mb-3">Leave Your Comment</h5>
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-3">
                  <textarea
                    className="form-control form-control-lg"
                    rows="4"
                    placeholder="What do you think about this initiative? Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submitting}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={submitting}
                >
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </form>
            </div>
          ) : (
            <div className="alert alert-info text-center mb-5">
              <strong>Login to leave a comment!</strong> Sign in to share your thoughts about the community.
            </div>
          )}

          {/* Comments List */}
          <div>
            <h5 className="fw-bold mb-4">
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </h5>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <div className="alert alert-secondary text-center">
                No comments yet. Be the first to share your thoughts!
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="card border-0 shadow-sm p-4 mb-3">
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
        }}
      >
        <div className="container">
          <h2 className="fw-bold mb-3">Join the Movement</h2>
          <p className="lead mb-4">
            Be part of a community that cares about sustainability and helping others
          </p>
          <a href="/products" className="btn btn-light btn-lg px-5">
            <i className="bi bi-shop me-2"></i>Start Browsing
          </a>
        </div>
      </section>
    </div>
  );
}

export default About;