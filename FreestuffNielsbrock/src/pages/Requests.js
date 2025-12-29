import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

function Requests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("requests")
        .select(`
          id,
          created_at,
          requester_email,
          items (
            id,
            name,
            image,
            description,
            posted_by
          )
        `)
        .eq("items.posted_by", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching requests:", error);
      } else {
        setRequests(data || []);
      }

      setLoading(false);
    };

    fetchRequests();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-inbox text-muted" style={{ fontSize: "5rem" }}></i>
        <h2 className="mt-4">No requests yet</h2>
        <p className="text-muted lead">
          When someone requests your items, they will appear here.
        </p>
        <Link to="/products" className="btn btn-success btn-lg mt-3">
          Browse Items
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">
        Item Requests ({requests.length})
      </h2>

      <div className="row">
        {requests.map((req) => (
          <div key={req.id} className="col-md-6 col-lg-4 mb-4">
            <div className="card h-100 shadow-sm">
              <img
                src={
                  req.items?.image ||
                  `https://via.placeholder.com/300x200?text=${req.items?.name}`
                }
                className="card-img-top"
                alt={req.items?.name}
                style={{ height: "200px", objectFit: "cover" }}
              />

              <div className="card-body d-flex flex-column">
                <h5 className="fw-bold">{req.items?.name}</h5>

                <p className="text-muted small">
                  {req.items?.description?.substring(0, 80)}...
                </p>

                <p className="small mb-1">
                  <strong>Requester:</strong><br />
                  {req.requester_email}
                </p>

                <small className="text-muted">
                  Requested on{" "}
                  {new Date(req.created_at).toLocaleDateString()}
                </small>

                <div className="mt-auto d-flex gap-2 pt-3">
                  <Link
                    to={`/product/${req.items?.id}`}
                    className="btn btn-outline-primary flex-grow-1"
                  >
                    View Item
                  </Link>

                  <a
                    href={`mailto:${req.requester_email}`}
                    className="btn btn-outline-success"
                    title="Contact requester"
                  >
                    <i className="bi bi-envelope"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Requests;
