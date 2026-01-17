import React, { useState, useEffect } from 'react';
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
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!user) {
      setError('Please sign in to report items');
      return;
    }

    if (!itemId) {
      setError('Error: Item ID is missing');
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
          setError('Failed to submit report. Please try again.');
        }
        setSubmitting(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Report error:', err);
      setError('An unexpected error occurred');
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setError('');
    setSuccess(false);
    setReason('');
    setDescription('');
    setSubmitting(false);
  };

  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-sm btn-outline-danger"
        title="Report this item"
      >
        🚩 Report
      </button>
    );
  }

  return (
    <>
      {/* Report Button - Hidden when modal is open */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-sm btn-outline-danger"
        title="Report this item"
        style={{ visibility: 'hidden' }}
      >
        🚩 Report
      </button>

      {/* Modal Portal */}
      <div 
        className="modal show d-block" 
        tabIndex="-1"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1050,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          overflow: 'auto'
        }}
        onClick={handleBackdropClick}
      >
        <div 
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            {/* Modal Header */}
            <div className="modal-header">
              <h5 className="modal-title">Report Item</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
                disabled={submitting}
              ></button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {success ? (
                <div className="text-center py-4">
                  <div className="mb-3" style={{ fontSize: '3rem' }}>✅</div>
                  <h5>Thank you for your report!</h5>
                  <p className="text-muted">We will review this item shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} id="reportForm">
                  {/* Item Title */}
                  <div className="mb-3">
                    <label htmlFor="item-title" className="form-label">
                      Item
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="item-title"
                      value={itemTitle || 'Unknown Item'}
                      disabled
                    />
                  </div>

                  {/* Reason */}
                  <div className="mb-3">
                    <label htmlFor="reason" className="form-label">
                      Reason <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="reason"
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
                    <label htmlFor="description" className="form-label">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more information..."
                      maxLength={500}
                      disabled={submitting}
                    />
                    <small className="form-text text-muted">
                      {description.length}/500 characters
                    </small>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Form Note */}
                  <div className="alert alert-info" role="alert">
                    <small>
                      Reports are reviewed by moderators. False reports may result in account suspension.
                    </small>
                  </div>

                  {/* Modal Footer Buttons */}
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
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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