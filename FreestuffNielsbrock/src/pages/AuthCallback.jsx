// src/pages/AuthCallback.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Give Supabase a moment to process the OAuth/magic-link callback
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Error getting user:", error);
          navigate("/login", { replace: true });
          return;
        }

        if (user) {
          console.log("User logged in:", user.email);
          console.log("User metadata:", user.user_metadata);

          const fullName = user.user_metadata?.full_name;
          const section = user.user_metadata?.section;

          if (fullName && section) {
            // Profile complete — go home
            navigate("/", { replace: true });
          } else {
            // New user — collect profile details
            navigate("/onboarding", { replace: true });
          }
        } else {
          console.error("No user found after callback");
          navigate("/login", { replace: true });
        }
      } catch (err) {
        console.error("Callback error:", err);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #667788 0%, #0b0f3b 100%)" }}
    >
      <div className="text-center text-white">
        <div
          className="spinner-border mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem", color: "#00A9E0" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="fw-semibold" style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem" }}>
          Completing login...
        </p>
        {!loading && (
          <small className="d-block mt-2" style={{ color: "#ffcc80" }}>
            Taking longer than expected. Redirecting...
          </small>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;