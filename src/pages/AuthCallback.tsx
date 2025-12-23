import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the current user
        const { data: { user }, error } = await supabase.auth.getUser();

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
            console.log("Profile complete, going to home");
            navigate("/", { replace: true });
          } else {
            console.log("Profile incomplete, going to onboarding");
            navigate("/onboarding", { replace: true });
          }
        } else {
          console.error("No user found");
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Completing login...</p>
        {!loading && (
          <small className="text-danger d-block mt-2">
            Taking longer than expected. Redirecting...
          </small>
        )}
      </div>
    </div>
  );
}

export default AuthCallback;