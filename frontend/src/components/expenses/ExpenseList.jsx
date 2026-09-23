import React from 'react';

const ExpenseList = ({ expenses, isLoading, onEdit, onDeleteClick }) => {
  if (isLoading) {
    return (
      <div className="table-card">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading expense records...</p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <h3 className="empty-title">No expenses found</h3>
          <p className="empty-desc">No expenses match the selected filters. Try clearing filters or add a new expense.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Note</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <span className="product-name">{expense.title}</span>
                </td>
                <td>
                  <span className="badge category">{expense.category}</span>
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
                    LKR {Number(expense.amount).toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '200px', display: 'inline-block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {expense.note || '—'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => onEdit(expense)}
                      title="Edit Expense"
                      aria-label="Edit Expense"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={() => onDeleteClick(expense)}
                      title="Delete Expense"
                      aria-label="Delete Expense"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
