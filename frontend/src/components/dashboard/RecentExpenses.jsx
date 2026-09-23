import React from 'react';
import { formatLKR } from '../../services/dashboardService';

const RecentExpenses = ({ expenses = [] }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="card-panel">
        <h3 className="panel-title">Recent Expenses</h3>
        <div className="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <p style={{ marginTop: '0.5rem' }}>No expenses recorded yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-panel">
      <div className="panel-header">
        <h3 className="panel-title">Recent Expenses</h3>
        <span className="badge warning">{expenses.length} Records</span>
      </div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id || `${expense.category}-${expense.amount}`}>
                <td>
                  <span className="badge category">{expense.category || 'General'}</span>
                </td>
                <td className="text-secondary">{expense.description || '—'}</td>
                <td className="text-danger font-semibold">{formatLKR(expense.amount)}</td>
                <td className="text-secondary">
                  {expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentExpenses;
