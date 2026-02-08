import React, { useMemo, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";

const REPORT_REASONS = [
  { value: "suspicious", label: "Seems fishy / suspicious" },
  { value: "inappropriate_content", label: "Inappropriate Content" },
  { value: "spam", label: "Spam" },
  { value: "scam", label: "Scam/Fraud" },
  { value: "already_sold", label: "Already Sold" },
  { value: "misleading", label: "Misleading Information" },
  { value: "other", label: "Other" },
];

function ReportButton({ itemId, itemTitle }) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const canOpen = !!user;
  const isDisabled = useMemo(() => submitting, [submitting]);

  const resetMessages = () => {
    setError("");
    setSuccessMsg("");
  };

  const resetForm = () => {
    setReason("");
    setDescription("");
  };

  const toggle = () => {
    if (!canOpen) {
      alert("Please sign in to report items.");
      return;
    }
    resetMessages();
    setOpen((v) => !v);
  };

  const closePanel = () => {
    if (submitting) return;
    setOpen(false);
    resetMessages();
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    // ✅ Strong validation (no silent fails)
    if (!user) {
      setError("Please sign in to report items.");
      return;
    }
    if (!itemId) {
      setError("Item id is missing. (itemId is undefined)");
      return;
    }
    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = [
        {
          item_id: itemId, // ✅ USES item_id (your requirement)
          reporter_id: user.id,
          reporter_email: user.email || null,
          reason,
          description: description?.trim() ? description.trim() : null,
          status: "pending",
        },
      ];

      const { error: insertError } = await supabase.from("reports").insert(payload);

      if (insertError) {
        console.error("Report insert error:", insertError);

        // Common helpful messages
        if (insertError.code === "23505") {
          setError("You have already reported this item.");
        } else if (
          insertError.message?.toLowerCase().includes("row-level security") ||
          insertError.message?.toLowerCase().includes("rls")
        ) {
          setError("Permission denied (RLS). Please add an INSERT policy for reports.");
        } else if (insertError.message?.toLowerCase().includes("column")) {
          setError(insertError.message);
        } else {
          setError(insertError.message || "Failed to submit report. Please try again.");
        }
        return;
      }

      setSuccessMsg("✅ Report submitted. Thanks!");
      resetForm();

      // Optional: auto close after success (smooth, no glitch)
      setTimeout(() => {
        setOpen(false);
        resetMessages();
      }, 1200);
    } catch (err) {
      console.error("Report submit catch:", err);
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="d-flex flex-column align-items-end" style={{ minWidth: 240 }}>
      {/* Toggle Button */}
      <button
        type="button"
        className={`btn btn-sm ${open ? "btn-danger" : "btn-outline-danger"}`}
        onClick={toggle}
        title="Report this item"
      >
        🚩 {open ? "Close report" : "Report"}
      </button>

      {/* Side Panel */}
      {open && (
        <div className="mt-2 p-3 border rounded bg-light w-100">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <strong>Report Item</strong>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={closePanel}
              disabled={isDisabled}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="mb-2">
            <div className="small text-muted">Item</div>
            <div className="fw-semibold">{itemTitle || "Unknown item"}</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="form-label mb-1">
                Reason <span className="text-danger">*</span>
              </label>
              <select
                className="form-select form-select-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isDisabled}
                required
              >
                <option value="">Select a reason</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-2">
              <label className="form-label mb-1">Details (optional)</label>
              <textarea
                className="form-control form-control-sm"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what seems wrong..."
                maxLength={500}
                disabled={isDisabled}
              />
              <div className="small text-muted">{description.length}/500</div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-2" role="alert">
                <small>{error}</small>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success py-2 mb-2" role="alert">
                <small>{successMsg}</small>
              </div>
            )}

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-danger btn-sm"
                disabled={isDisabled || !reason}
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  resetForm();
                  resetMessages();
                }}
                disabled={isDisabled}
              >
                Clear
              </button>
            </div>

            <div className="mt-2">
              <small className="text-muted">
                Reports are reviewed by moderators. False reports may result in account action.
              </small>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ReportButton;
