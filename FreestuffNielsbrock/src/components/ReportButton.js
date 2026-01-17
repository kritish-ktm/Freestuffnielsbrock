import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

const REPORT_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'spam', label: 'Spam' },
  { value: 'scam', label: 'Scam/Fraud' },
  { value: 'already_sold', label: 'Already Sold' },
  { value: 'misleading', label: 'Misleading Information' },
  { value: 'other', label: 'Other' }
];

function ReportButton({ itemId, itemTitle }) {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Generate unique modal ID
  const modalId = `reportModal-${itemId}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please sign in to report items');
      return;
    }

    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from('reports')
        .insert({
          item_id: itemId,
          reporter_id: user.id,
          reason: reason,
          description: description || null,
          reporter_email: user.email,
        });

      if (submitError) {
        if (submitError.code === '23505') {
          setError('You have already reported this item.');
        } else {
          console.error('Report error:', submitError);
          setError('Failed to submit report. Please try again.');
        }
        setSubmitting(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          // Close modal using Bootstrap's modal instance
          const modalElement = document.getElementById(modalId);
          if (modalElement) {
            const modal = window.bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
          }
          // Reset form
          setReason('');
          setDescription('');
          setSuccess(false);
          setError('');
        }, 2000);
      }
    } catch (err) {
      console.error('Report error:', err);
      setError('An unexpected error occurred');
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setReason('');
    setDescription('');
    setError('');
    setSuccess(false);
    setSubmitting(false);
  };

  return (
    <>
      {/* Report Button - triggers Bootstrap modal */}
      <button
        type="button"
        className="btn btn-sm btn-outline-danger"
        data-bs-toggle="modal"
        data-bs-target={`#${modalId}`}
        title="Report this item"
      >
        🚩 Report
      </button>

      {/* Bootstrap Modal */}
      <div 
        className="modal fade" 
        id={modalId}
        tabIndex="-1"
        aria-labelledby={`${modalId}Label`}
        aria-hidden="true"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id={`${modalId}Label`}>
                Report Item
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={handleModalClose}
                disabled={submitting}
              ></button>
            </div>

            <div className="modal-body">
              {success ? (
                <div className="text-center py-4">
                  <div className="mb-3" style={{ fontSize: '3rem' }}>✅</div>
                  <h5>Thank you for your report!</h5>
                  <p className="text-muted">We will review this item shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {/* Item Title */}
                  <div className="mb-3">
                    <label className="form-label">Item</label>
                    <input
                      type="text"
                      className="form-control"
                      value={itemTitle || 'Unknown Item'}
                      disabled
                    />
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
                      required
                      disabled={submitting}
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
                    <label className="form-label">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more information..."
                      maxLength={500}
                      disabled={submitting}
                    />
                    <small className="text-muted">
                      {description.length}/500 characters
                    </small>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Info Note */}
                  <div className="alert alert-info" role="alert">
                    <small>
                      Reports are reviewed by moderators. False reports may result in account suspension.
                    </small>
                  </div>

                  {/* Buttons */}
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary flex-fill"
                      data-bs-dismiss="modal"
                      onClick={handleModalClose}
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
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        'Submit Report'
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
  );
}

export default ReportButton;