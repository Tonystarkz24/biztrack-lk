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
    <div style={{
      backgroundColor: '#ffffff',
      padding: '24px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
      marginBottom: '24px',
      border: '1px solid #e2e8f0'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>
        {expenseToEdit ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      
      {apiError && (
        <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Title *</label>
            <input 
              name="title" value={formData.title} onChange={handleChange}
              placeholder="Enter expense title"
              style={{ padding: '8px', backgroundColor: '#f8fafc', color: '#0f172a', border: errors.title ? '1px solid red' : '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
            />
            {errors.title && <span style={{ color: 'red', fontSize: '12px' }}>{errors.title}</span>}
          </div>

          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Category *</label>
            <select 
              name="category" value={formData.category} onChange={handleChange}
              style={{ padding: '8px', backgroundColor: '#f8fafc', color: '#0f172a', border: errors.category ? '1px solid red' : '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <span style={{ color: 'red', fontSize: '12px' }}>{errors.category}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Amount *</label>
            <input 
              type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange}
              placeholder="0.00"
              style={{ padding: '8px', backgroundColor: '#f8fafc', color: '#0f172a', border: errors.amount ? '1px solid red' : '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
            />
            {errors.amount && <span style={{ color: 'red', fontSize: '12px' }}>{errors.amount}</span>}
          </div>

          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500' }}>Date *</label>
            <input 
              type="date" name="expenseDate" value={formData.expenseDate} onChange={handleChange}
              style={{ padding: '8px', backgroundColor: '#f8fafc', color: '#0f172a', border: errors.expenseDate ? '1px solid red' : '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
            />
            {errors.expenseDate && <span style={{ color: 'red', fontSize: '12px' }}>{errors.expenseDate}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500' }}>Note (Optional)</label>
          <textarea 
            name="note" value={formData.note} onChange={handleChange} rows={3}
            placeholder="Add any additional notes here..."
            style={{ padding: '8px', backgroundColor: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '4px', resize: 'vertical', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
            >
              Cancel
            </button>
          )}
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: '500' }}
          >
            {isSubmitting ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
