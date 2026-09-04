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
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Delete Expense</h3>
        
        <p style={{ color: '#475569', marginBottom: '24px' }}>
          Are you sure you want to delete the expense <strong>{expense.title}</strong>? 
          This action cannot be undone.
        </p>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onClose}
            disabled={isDeleting}
            style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: isDeleting ? 'not-allowed' : 'pointer' }}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpenseModal;
