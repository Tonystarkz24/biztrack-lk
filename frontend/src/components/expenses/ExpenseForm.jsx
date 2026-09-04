import React, { useState, useEffect } from 'react';
import expenseService from '../../services/expenseService';

const CATEGORIES = [
  'Electricity', 'Water', 'Rent', 'Transport', 
  'Packaging', 'Maintenance', 'Salary', 'Other'
];

const INITIAL_STATE = {
  title: '',
  category: '',
  amount: '',
  expenseDate: '',
  note: ''
};

const ExpenseForm = ({ expenseToEdit, onSave, onCancel }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title || '',
        category: expenseToEdit.category || '',
        amount: expenseToEdit.amount || '',
        expenseDate: expenseToEdit.expense_date ? expenseToEdit.expense_date.split('T')[0] : '',
        note: expenseToEdit.note || ''
      });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [expenseToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title || formData.title.length < 2 || formData.title.length > 100) {
      newErrors.title = 'Title must be between 2 and 100 characters.';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required.';
    }
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero.';
    }
    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Date is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount)
      };

      if (expenseToEdit) {
        await expenseService.update(expenseToEdit.id, payload);
      } else {
        await expenseService.create(payload);
      }
      onSave(); // trigger refresh and close form
      setFormData(INITIAL_STATE);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save expense. Please try again.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card-panel" style={{ marginBottom: '1.5rem' }}>
      <h3 className="panel-title">
        {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      
      {apiError && (
        <div className="toast-banner error" style={{ marginBottom: '1rem' }}>
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-title">
              Title <span className="required">*</span>
            </label>
            <input 
              id="expense-title"
              name="title"
              type="text"
              className={`form-input ${errors.title ? 'has-error' : ''}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter expense title"
              disabled={isSubmitting}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-category-select">
              Category <span className="required">*</span>
            </label>
            <select 
              id="expense-category-select"
              name="category"
              className={`form-input ${errors.category ? 'has-error' : ''}`}
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span className="form-error">{errors.category}</span>}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-amount">
              Amount (LKR) <span className="required">*</span>
            </label>
            <input 
              id="expense-amount"
              type="number"
              step="0.01"
              name="amount"
              className={`form-input ${errors.amount ? 'has-error' : ''}`}
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              disabled={isSubmitting}
            />
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="expense-date">
              Date <span className="required">*</span>
            </label>
            <input 
              id="expense-date"
              type="date"
              name="expenseDate"
              className={`form-input ${errors.expenseDate ? 'has-error' : ''}`}
              value={formData.expenseDate}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.expenseDate && <span className="form-error">{errors.expenseDate}</span>}
          </div>

          {/* Note */}
          <div className="form-group full-width">
            <label className="form-label" htmlFor="expense-note">
              Note (Optional)
            </label>
            <textarea 
              id="expense-note"
              name="note"
              className="form-input"
              value={formData.note}
              onChange={handleChange}
              rows={3}
              placeholder="Add any additional notes here..."
              disabled={isSubmitting}
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="modal-footer" style={{ background: 'transparent', border: 'none', padding: '1rem 0 0' }}>
          {onCancel && (
            <button 
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
