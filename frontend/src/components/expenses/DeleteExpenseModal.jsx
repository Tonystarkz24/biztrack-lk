import React, { useState } from 'react';
import expenseService from '../../services/expenseService';

const DeleteExpenseModal = ({ expense, onClose, onSuccess }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!expense) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await expenseService.delete(expense.id);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget && !isDeleting) onClose(); }}>
      <div className="modal-dialog" style={{ maxWidth: '440px' }} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3 className="modal-title" style={{ color: '#f87171' }}>Delete Expense</h3>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Are you sure you want to delete the expense <strong>{expense.title}</strong>? 
            This action cannot be undone.
          </p>

          {error && (
            <div className="toast-banner error" style={{ marginTop: '1rem' }}>
              <span>{error}</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button 
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpenseModal;
