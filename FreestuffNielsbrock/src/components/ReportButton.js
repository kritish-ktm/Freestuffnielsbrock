import React, { useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { sanitizeText } from '../utils/sanitize';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!user) {
      setError('Please sign in to report items');
      return;
    }

    if (!itemId) {
      setError('Error: Item ID is missing. Please refresh the page.');
      console.error('ReportButton: itemId is undefined');
      return;
    }

    if (!reason) {
      setError('Please select a reason');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      console.log('Submitting report with data:', {
        item_id: itemId,
        reporter_id: user.id,
        reason: reason,
        description: sanitizeText(description)
      });

      const { data, error: submitError } = await supabase
        .from('reports')
        .insert({
          item_id: itemId,
          reporter_id: user.id,
          reason: reason,
          description: description ? sanitizeText(description) : null,
          reporter_email: user.email,
        });

      if (submitError) {
        console.error('Supabase error:', submitError);
        
        if (submitError.message.includes('violates row-level security')) {
          setError('You have reported too many items recently. Please try again later.');
        } else if (submitError.code === '23505') {
          setError('You have already reported this item.');
        } else if (submitError.message.includes('violates foreign key')) {
          setError('This item no longer exists.');
        } else {
          setError('Failed to submit report: ' + submitError.message);
        }
      } else {
        console.log('Report submitted successfully:', data);
        setSuccess(true);
        setTimeout(() => {
          setShowModal(false);
          setSuccess(false);
          setReason('');
          setDescription('');
        }, 2000);
      }
    } catch (err) {
      console.error('Report error:', err);
      setError('An unexpected error occurred: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setError('');
    setSuccess(false);
    setReason('');
    setDescription('');
  };

  // Debug: Log props when component renders
  console.log('ReportButton rendered with:', { itemId, itemTitle });

  return (
    <>
      {/* Report Button */}
      <button
        onClick={() => setShowModal(true)}
        className="btn btn-sm btn-outline-danger"
        title="Report this item"
      >
        🚩 Report
      </button>

      {/* Bootstrap Modal */}
      {showModal && (
        <>
          {/* Modal Backdrop */}
          <div 
            className="modal-backdrop fade show" 
            onClick={handleClose}
          ></div>

          {/* Modal */}
          <div 
            className="modal fade show d-block" 
            tabIndex="-1" 
            role="dialog"
            style={{ display: 'block' }}
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                {/* Modal Header */}
                <div className="modal-header">
                  <h5 className="modal-title">Report Item</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleClose}
                    aria-label="Close"
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
                    <form onSubmit={handleSubmit}>
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

                      {/* Debug Info (only in development) */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="alert alert-secondary small mb-3">
                          <strong>Debug:</strong> Item ID: {itemId || 'MISSING'}
                        </div>
                      )}

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
                          disabled={submitting || !reason || !itemId}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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
      )}
    </>
  );
}

export default ReportButton;