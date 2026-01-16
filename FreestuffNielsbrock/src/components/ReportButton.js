import React, { useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../context/AuthContext";
import { sanitizeText } from "../utils/sanitize";

const REPORT_REASONS = [
  { value: "suspicious", label: "Seems fishy / suspicious" },
  { value: "scam", label: "Scam / Fraud" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "misleading", label: "Misleading information" },
  { value: "already_sold", label: "Already sold / not available" },
  { value: "other", label: "Other" },
];

function ReportButton({
  reportedId,   // ✅ uuid to be stored in reports.reported_id
  title,        // ✅ item name (display only)
  reportType = "item", // ✅ stored in reports.report_type
}) {
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setReason("");
    setDescription("");
    setError("");
    setSuccess(false);
  };

  const handleClose = () => {
    if (submitting) return;
    setShowModal(false);
    resetForm();
  };

  const handleOpen = () => {
    if (!user) {
      alert("Please log in to report items.");
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please sign in to report items.");
      return;
    }
    if (!reportedId) {
      setError("Missing item id (reportedId).");
      return;
    }
    if (!reason) {
      setError("Please select a reason.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const cleanDesc = sanitizeText(description || "");
      const payload = [{
        report_type: reportType,        // ✅ required
        reported_id: reportedId,        // ✅ required (uuid)
        reporter_id: user.id,           // ✅ required (uuid)
        reporter_email: user.email || null,
        reason,                         // ✅ required
        description: cleanDesc ? cleanDesc : null,
        // status + created_at handled by defaults
      }];

      const { error: submitError } = await supabase
        .from("reports")
        .insert(payload);

      if (submitError) {
        console.error("Report submit error:", submitError);
        setError(submitError.message || "Failed to submit report.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 1500);
    } catch (err) {
      console.error("Report catch error:", err);
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={handleOpen}
        className="btn btn-sm btn-outline-danger"
        title="Report this item"
      >
        🚩 Report
      </button>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={handleClose} />

          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Report</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleClose}
                    aria-label="Close"
                    disabled={submitting}
                  />
                </div>

                <div className="modal-body">
                  {success ? (
                    <div className="text-center py-4">
                      <div className="mb-3" style={{ fontSize: "3rem" }}>✅</div>
                      <h5>Thank you for your report!</h5>
                      <p className="text-muted mb-0">We’ll review it shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      {/* Title */}
                      <div className="mb-3">
                        <label className="form-label">Item</label>
                        <input className="form-control" value={title || ""} disabled />
                      </div>

                      {/* Reason */}
                      <div className="mb-3">
                        <label className="form-label">
                          Reason <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          disabled={submitting}
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

                      {/* Description */}
                      <div className="mb-3">
                        <label className="form-label">Additional details (optional)</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Explain what seems wrong (optional)"
                          maxLength={500}
                          disabled={submitting}
                        />
                        <small className="text-muted">
                          {description.length}/500 characters
                        </small>
                      </div>

                      {/* Error */}
                      {error && (
                        <div className="alert alert-danger" role="alert">
                          {error}
                        </div>
                      )}

                      <div className="alert alert-info" role="alert">
                        <small>
                          Reports are reviewed by moderators. False reports may result in account action.
                        </small>
                      </div>

                      {/* Buttons */}
                      <div className="d-flex gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary flex-fill"
                          onClick={handleClose}
                          disabled={submitting}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="btn btn-danger flex-fill"
                          disabled={submitting || !reason}
                        >
                          {submitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              />
                              Submitting...
                            </>
                          ) : (
                            "Submit Report"
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ReportButton;
