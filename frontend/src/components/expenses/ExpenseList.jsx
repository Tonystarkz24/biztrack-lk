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
          <div className="empty-icon" role="img" aria-label="no expenses">💸</div>
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
                  <span style={{ fontWeight: 600, color: '#f87171' }}>
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
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="btn-icon danger"
                      onClick={() => onDeleteClick(expense)}
                      title="Delete Expense"
                      aria-label="Delete Expense"
                    >
                      🗑️
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
